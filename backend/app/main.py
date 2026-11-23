import asyncio
import hashlib
import hmac
import json
import os
import secrets
from concurrent.futures import ThreadPoolExecutor
from contextlib import asynccontextmanager
from typing import Annotated

from fastapi import Depends, FastAPI, File, Form, HTTPException, Query, UploadFile
from fastapi.concurrency import run_in_threadpool
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from pydantic import EmailStr, TypeAdapter, ValidationError
from sqlalchemy import select, update
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from .browser_agent import demo_path
from .database import Base, engine, get_db
from .eligibility_checker import check_eligibility
from .models import Application, Profile
from .opportunity_matcher import load_opportunities, match_skills
from .resume_parser import ResumeError, parse_pdf
from .schemas import (
    ApplicationCreate, ApplicationResponse, ApplicationStatus, DemoPreparation,
    EligibilityResult, Opportunity, OpportunityMatch, ProfileResponse,
)

MAX_PDF_BYTES = int(os.getenv("APPLY_PILOT_MAX_PDF_BYTES", 5 * 1024 * 1024))
OPPORTUNITIES = load_opportunities()
DEMO_SECRET = secrets.token_bytes(32)
EMAIL_ADAPTER = TypeAdapter(EmailStr)
PDF_EXECUTOR = ThreadPoolExecutor(max_workers=1, thread_name_prefix="resume-pdf")


@asynccontextmanager
async def lifespan(_app: FastAPI):
    Base.metadata.create_all(engine)
    yield


app = FastAPI(title="ApplyPilot Backend", version="1.0.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)
Db = Annotated[Session, Depends(get_db)]
ProfileId = Annotated[int, Query(gt=0)]


def get_profile(db: Session, profile_id: int) -> Profile:
    profile = db.get(Profile, profile_id)
    if profile is None:
        raise HTTPException(404, "Profile not found.")
    return profile


def get_opportunity(opportunity_id: str) -> Opportunity:
    opportunity = OPPORTUNITIES.get(opportunity_id)
    if opportunity is None:
        raise HTTPException(404, "Opportunity not found.")
    return opportunity


def get_application(db: Session, application_id: int) -> Application:
    application = db.get(Application, application_id)
    if application is None:
        raise HTTPException(404, "Application not found.")
    return application


@app.post("/api/resume/upload", response_model=ProfileResponse, status_code=201)
async def upload_resume(db: Db, file: Annotated[UploadFile, File()]):
    try:
        if file.content_type not in {"application/pdf", "application/octet-stream"}:
            raise HTTPException(415, "Upload a PDF file.")
        data = await file.read(MAX_PDF_BYTES + 1)
        if len(data) > MAX_PDF_BYTES:
            raise HTTPException(413, f"PDF exceeds the {MAX_PDF_BYTES}-byte limit.")
        if not data.startswith(b"%PDF-"):
            raise HTTPException(415, "File contents are not a PDF.")
        try:
            # Keep all PyMuPDF work on a single thread.
            parsed = await asyncio.get_running_loop().run_in_executor(PDF_EXECUTOR, parse_pdf, data)
        except ResumeError as exc:
            raise HTTPException(422, str(exc)) from exc
    finally:
        await file.close()

    def save_profile():
        profile = Profile(**parsed)
        db.add(profile)
        db.commit()
        return ProfileResponse.model_validate(profile)

    return await run_in_threadpool(save_profile)


@app.get("/api/opportunities", response_model=list[Opportunity])
def list_opportunities():
    return list(OPPORTUNITIES.values())


@app.get("/api/opportunities/matches", response_model=list[OpportunityMatch])
def list_matches(db: Db, profile_id: ProfileId):
    profile = get_profile(db, profile_id)
    results = []
    for opportunity in OPPORTUNITIES.values():
        matched, missing, score = match_skills(profile.skills, opportunity.required_skills)
        status, reasons = check_eligibility(profile.education, opportunity.eligibility_requirements)
        results.append(OpportunityMatch(
            **opportunity.model_dump(), matched_skills=matched, missing_skills=missing,
            match_score=score, eligibility_status=status, eligibility_reasons=reasons,
        ))
    return sorted(results, key=lambda result: (-result.match_score, result.id))


@app.get("/api/opportunities/{opportunity_id}/eligibility", response_model=EligibilityResult)
def opportunity_eligibility(opportunity_id: str, db: Db, profile_id: ProfileId):
    profile = get_profile(db, profile_id)
    opportunity = get_opportunity(opportunity_id)
    status, reasons = check_eligibility(profile.education, opportunity.eligibility_requirements)
    return EligibilityResult(
        opportunity_id=opportunity.id, profile_id=profile.id, eligibility_status=status, reasons=reasons,
    )


@app.get("/api/applications", response_model=list[ApplicationResponse])
def list_applications(db: Db, profile_id: ProfileId):
    get_profile(db, profile_id)
    return db.scalars(select(Application).where(Application.profile_id == profile_id)
                      .order_by(Application.id)).all()


@app.post("/api/applications", response_model=ApplicationResponse, status_code=201)
def create_application(payload: ApplicationCreate, db: Db):
    get_profile(db, payload.profile_id)
    get_opportunity(payload.opportunity_id)
    application = Application(**payload.model_dump())
    db.add(application)
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(409, "An application already exists for this profile and opportunity.") from exc
    return application


@app.post("/api/applications/{application_id}/demo/prepare", response_model=DemoPreparation)
def prepare_demo(application_id: int, db: Db):
    updated = db.execute(update(Application).where(
        Application.id == application_id, Application.status == ApplicationStatus.DRAFT,
    ).values(status=ApplicationStatus.READY))
    if updated.rowcount:
        db.commit()
    application = get_application(db, application_id)
    if application.status != ApplicationStatus.READY:
        raise HTTPException(409, "This demo application has already been submitted.")
    return DemoPreparation(
        application=ApplicationResponse.model_validate(application),
        demo_path=demo_path(application.id),
        command=f"python -m app.browser_agent --application-id {application.id}",
    )


def form_token(application_id: int) -> str:
    return hmac.new(DEMO_SECRET, str(application_id).encode(), hashlib.sha256).hexdigest()


def demo_page(content: str, status_code: int = 200) -> HTMLResponse:
    return HTMLResponse(
        f"""<!doctype html><html lang="en"><meta charset="utf-8">
        <title>ApplyPilot local demo</title><main>{content}</main></html>""",
        status_code=status_code,
        headers={
            "Cache-Control": "no-store",
            "Content-Security-Policy": "default-src 'none'; form-action 'self'; frame-ancestors 'none'",
            "Referrer-Policy": "no-referrer",
        },
    )


@app.get("/demo/applications/{application_id}", response_class=HTMLResponse)
def demo_form(application_id: int, db: Db):
    application = get_application(db, application_id)
    if application.status != ApplicationStatus.READY:
        raise HTTPException(409, "Prepare an unsubmitted application before opening the demo.")
    return demo_page(f"""
        <h1>ApplyPilot local demo</h1>
        <p>Review your details before submitting to the local demo.</p>
        <form method="post" action="{demo_path(application_id)}">
          <input type="hidden" name="token" value="{form_token(application_id)}">
          <p><label>Name <input name="name" maxlength="160" required></label></p>
          <p><label>Email <input type="email" name="email" maxlength="254" required></label></p>
          <p><label>Phone <input type="tel" name="phone" maxlength="40"></label></p>
          <p><label>Skills <textarea name="skills" maxlength="4000"></textarea></label></p>
          <p><label>Education <textarea name="education" maxlength="10000"></textarea></label></p>
          <button type="submit">Submit local demo</button>
        </form>
    """)


@app.post("/demo/applications/{application_id}", response_class=HTMLResponse)
def submit_demo(
    application_id: int, db: Db, token: Annotated[str, Form(max_length=64)],
    name: Annotated[str, Form(max_length=160)], email: Annotated[str, Form(max_length=254)],
    phone: Annotated[str, Form(max_length=40)] = "",
    skills: Annotated[str, Form(max_length=4000)] = "",
    education: Annotated[str, Form(max_length=10000)] = "",
):
    if not hmac.compare_digest(token.encode(), form_token(application_id).encode()):
        raise HTTPException(403, "Open the local demo form and submit from there.")
    try:
        email = EMAIL_ADAPTER.validate_python(email)
    except ValidationError as exc:
        raise HTTPException(422, "Enter a valid email address.") from exc
    if not name.strip():
        raise HTTPException(422, "Enter a name.")
    submitted = {"name": name.strip(), "email": email, "phone": phone.strip(),
                 "skills": skills.strip(), "education": education.strip()}
    updated = db.execute(update(Application).where(
        Application.id == application_id, Application.status == ApplicationStatus.READY,
    ).values(status=ApplicationStatus.SUBMITTED, submitted_form=json.dumps(submitted)))
    if not updated.rowcount:
        get_application(db, application_id)
        raise HTTPException(409, "Only a prepared application can be submitted once.")
    db.commit()
    return demo_page("<h1>Local demo submission recorded.</h1><p>You can close this window.</p>")
