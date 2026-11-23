import sys
import json
import re
import socket
import threading
import time
import httpx
import uvicorn
import pymupdf

from app import main, browser_agent
from app.models import Profile, Application
from app.database import SessionLocal

def create_sample_pdf():
    with pymupdf.open() as pdf:
        page = pdf.new_page()
        page.insert_text(
            (60, 65),
            "Krupa G\n"
            "krupa.student@example.com\n"
            "+91 91234 56789\n\n"
            "Education\n"
            "B.Tech in Computer Science and Engineering\n"
            "Expected Graduation: 2027\n"
            "CGPA: 9.1/10\n\n"
            "Technical Skills\n"
            "Python, FastAPI, React, JavaScript, SQL, Git, Docker, Linux\n"
        )
        return pdf.tobytes()

def test_full_integration():
    print("=== STARTING FULL END-TO-END INTEGRATION TEST ===")
    with socket.socket() as listener:
        listener.bind(("127.0.0.1", 0))
        port = listener.getsockname()[1]
        origin = f"http://127.0.0.1:{port}"
        print(f"[1] Spawning loopback test server on {origin}...")

        config = uvicorn.Config(main.app, host="127.0.0.1", port=port, log_level="error")
        server = uvicorn.Server(config)
        thread = threading.Thread(target=server.run, kwargs={"sockets": [listener]}, daemon=True)
        thread.start()

        deadline = time.monotonic() + 10
        while not server.started and thread.is_alive() and time.monotonic() < deadline:
            time.sleep(0.05)
        assert server.started, "Server failed to start in 10s"
        print("    Server started successfully.")

        try:
            with httpx.Client(base_url=origin, trust_env=False, timeout=10.0) as client:
                
                # Step 1: Opportunities Catalog
                print("[2] Fetching opportunities catalog from /api/opportunities...")
                opps_resp = client.get("/api/opportunities")
                assert opps_resp.status_code == 200, f"Failed: {opps_resp.text}"
                opps = opps_resp.json()
                assert len(opps) == 10, f"Expected 10 opps, got {len(opps)}"
                print(f"    Loaded {len(opps)} opportunities.")

                # Step 2: Resume Upload & Parsing
                print("[3] Uploading PDF resume to /api/resume/upload...")
                pdf_data = create_sample_pdf()
                upload_resp = client.post(
                    "/api/resume/upload",
                    files={"file": ("krupa_resume.pdf", pdf_data, "application/pdf")},
                )
                assert upload_resp.status_code == 201, f"Failed upload: {upload_resp.text}"
                profile = upload_resp.json()
                profile_id = profile["profile_id"]
                assert profile["name"] == "Krupa G", f"Parsed name mismatch: {profile['name']}"
                assert profile["email"] == "krupa.student@example.com"
                assert "Python" in profile["skills"]
                assert "FastAPI" in profile["skills"]
                print(f"    Profile #{profile_id} created for {profile['name']} with {len(profile['skills'])} skills.")

                # Step 3: Opportunity Matching
                print(f"[4] Computing match scores for Profile #{profile_id}...")
                matches_resp = client.get(f"/api/opportunities/matches?profile_id={profile_id}")
                assert matches_resp.status_code == 200
                matches = matches_resp.json()
                top_match = matches[0]
                print(f"    Top Match: {top_match['role']} at {top_match['company']}")
                print(f"    Match Score: {top_match['match_score']}%, Status: {top_match['eligibility_status']}")
                assert top_match["id"] == "backend-intern"
                assert top_match["match_score"] == 100
                assert top_match["eligibility_status"] == "eligible"

                # Step 4: AI Eligibility Checker
                print(f"[5] Checking eligibility explanation for top match...")
                elig_resp = client.get(f"/api/opportunities/backend-intern/eligibility?profile_id={profile_id}")
                assert elig_resp.status_code == 200
                elig = elig_resp.json()
                assert elig["eligibility_status"] == "eligible"
                print(f"    Reasons: {elig['reasons']}")

                # Step 5: Application Creation (Draft)
                print(f"[6] Creating application draft for backend-intern...")
                app_resp = client.post("/api/applications", json={
                    "profile_id": profile_id,
                    "opportunity_id": "backend-intern",
                })
                assert app_resp.status_code == 201
                app_data = app_resp.json()
                app_id = app_data["id"]
                assert app_data["status"] == "Draft"
                print(f"    Application #{app_id} created with status 'Draft'.")

                # Step 6: Application Demo Preparation
                print(f"[7] Preparing demo application #{app_id}...")
                prep_resp = client.post(f"/api/applications/{app_id}/demo/prepare")
                assert prep_resp.status_code == 200
                prep_data = prep_resp.json()
                assert prep_data["application"]["status"] == "Ready for Review"
                demo_path = prep_data["demo_path"]
                print(f"    Application status updated to 'Ready for Review'. Demo path: {demo_path}")

                # Step 7: Local Demo Form & Token Retrieval
                print(f"[8] Fetching demo review form HTML...")
                form_resp = client.get(demo_path)
                assert form_resp.status_code == 200
                token_match = re.search(r'name="token"\s+value="([^"]+)"', form_resp.text)
                assert token_match, "Token not found in demo form HTML"
                token = token_match.group(1)
                print(f"    Retrieved valid security token.")

                # Step 8: Explicit User Confirmation & Submission
                print(f"[9] Submitting demo application with explicit confirmation...")
                submit_resp = client.post(demo_path, data={
                    "token": token,
                    "name": profile["name"],
                    "email": profile["email"],
                    "phone": profile["phone"],
                    "skills": ", ".join(profile["skills"]),
                    "education": "\n".join(profile["education"]),
                })
                assert submit_resp.status_code == 200
                assert "Local demo submission recorded." in submit_resp.text
                print("    Backend confirmed submission.")

                # Step 9: Application Tracker Persistence
                print(f"[10] Verifying application tracker state for Profile #{profile_id}...")
                track_resp = client.get(f"/api/applications?profile_id={profile_id}")
                assert track_resp.status_code == 200
                track_list = track_resp.json()
                assert len(track_list) == 1
                assert track_list[0]["status"] == "Submitted"
                print(f"    Application #{track_list[0]['id']} persisted in tracker with status 'Submitted'!")

                print("=== ALL 10 END-TO-END INTEGRATION CHECKS PASSED PERFECTLY! ===")
        finally:
            server.should_exit = True
            thread.join(timeout=5)

if __name__ == "__main__":
    test_full_integration()
