import json
import re

import pymupdf
import pytest
from sqlalchemy.exc import IntegrityError

from app import main
from app.models import Application, Profile
from conftest import upload


def test_upload_extracts_and_persists_fields(profile, database):
    assert profile == {
        "profile_id": 1, "name": "Alex Example", "email": "Alex.Example@example.com",
        "phone": "+91 98765 43210",
        "education": ["B.Tech in Computer Science", "Expected Graduation: 2027"],
        "skills": ["Python", "FastAPI", "SQL", "Git", "React", "C++"],
    }
    with database() as db:
        assert db.get(Profile, profile["profile_id"]).skills == profile["skills"]


def test_pdf_rejections(client, demo_pdf, monkeypatch):
    assert client.post("/api/resume/upload").status_code == 422
    assert client.post("/api/resume/upload", files={
        "file": ("fake.txt", demo_pdf, "text/plain"),
    }).status_code == 415
    assert upload(client, b"not a PDF").status_code == 415
    assert upload(client, b"%PDF-1.7\ncorrupt").status_code == 422
    with pymupdf.open() as document:
        document.new_page()
        scanned = upload(client, document.tobytes())
        assert scanned.status_code == 422
        assert "No selectable text" in scanned.json()["detail"]
        locked = document.tobytes(encryption=pymupdf.PDF_ENCRYPT_AES_256, user_pw="example")
        assert "unencrypted" in upload(client, locked).json()["detail"]
    monkeypatch.setattr(main, "MAX_PDF_BYTES", len(demo_pdf) - 1)
    assert upload(client, demo_pdf).status_code == 413


def test_catalog_matching_docs_and_cors(client, profile):
    catalog = client.get("/api/opportunities").json()
    assert len(catalog) == len({item["id"] for item in catalog}) == 10
    assert all("(Fictional)" in item["company"] for item in catalog)
    profile_id = profile["profile_id"]
    results = client.get(f"/api/opportunities/matches?profile_id={profile_id}").json()
    assert results[0]["id"] == "backend-intern"
    assert results[0]["match_score"] == 100
    assert results[0]["missing_skills"] == []
    assert results[0]["eligibility_status"] == "eligible"
    assert [item["match_score"] for item in results] == sorted(
        (item["match_score"] for item in results), reverse=True,
    )
    eligibility = client.get(f"/api/opportunities/backend-intern/eligibility?profile_id={profile_id}")
    assert eligibility.json()["eligibility_status"] == "eligible"
    assert client.get(f"/api/opportunities/unknown/eligibility?profile_id={profile_id}").status_code == 404
    assert client.get("/api/opportunities/matches?profile_id=999").status_code == 404
    assert client.get("/api/opportunities/matches?profile_id=0").status_code == 422
    assert client.get("/docs").status_code == 200
    assert "/api/resume/upload" in client.get("/openapi.json").json()["paths"]
    preflight = client.options("/api/applications", headers={
        "Origin": "http://localhost:5173", "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "content-type",
    })
    assert preflight.headers["access-control-allow-origin"] == "http://localhost:5173"


def test_application_lifecycle(client, profile, database):
    payload = {"profile_id": profile["profile_id"], "opportunity_id": "backend-intern"}
    assert client.get("/api/applications?profile_id=1").json() == []
    assert client.post("/api/applications", json={**payload, "status": "Submitted"}).status_code == 422
    assert client.post("/api/applications", json={**payload, "opportunity_id": "unknown"}).status_code == 404
    created = client.post("/api/applications", json=payload)
    assert created.status_code == 201
    assert created.json()["status"] == "Draft"
    assert client.post("/api/applications", json=payload).status_code == 409
    prepare = "/api/applications/1/demo/prepare"
    form = "/demo/applications/1"
    assert client.get(form).status_code == 409
    assert client.post(prepare).json()["application"]["status"] == "Ready for Review"
    assert client.post(prepare).status_code == 200
    token = re.search(r'name="token" value="([^"]+)"', client.get(form).text)[1]
    fields = {"name": "Alex Example", "email": profile["email"], "skills": "SQL"}
    assert client.post(form, data={**fields, "token": "invalid"}).status_code == 403
    assert client.post(form, data={**fields, "token": token, "email": "invalid"}).status_code == 422
    assert client.get("/api/applications?profile_id=1").json()[0]["status"] == "Ready for Review"
    assert "Local demo submission recorded." in client.post(form, data={**fields, "token": token}).text
    assert client.post(form, data={**fields, "token": token}).status_code == 409
    assert client.post(prepare).status_code == 409
    assert client.get("/api/applications?profile_id=1").json()[0]["status"] == "Submitted"
    with database() as db:
        assert json.loads(db.get(Application, 1).submitted_form)["skills"] == "SQL"
        db.add(Application(profile_id=999, opportunity_id="backend-intern"))
        with pytest.raises(IntegrityError):
            db.commit()
