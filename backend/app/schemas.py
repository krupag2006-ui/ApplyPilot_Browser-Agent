from datetime import date
from enum import StrEnum

from pydantic import BaseModel, ConfigDict, Field


class ProfileResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    profile_id: int = Field(validation_alias="id")
    name: str | None
    email: str | None
    phone: str | None
    education: list[str]
    skills: list[str]


class EligibilityRequirements(BaseModel):
    allowed_degrees: list[str]
    graduation_year_min: int | None = None
    graduation_year_max: int | None = None


class Opportunity(BaseModel):
    id: str
    company: str
    role: str
    location: str
    deadline: date
    required_skills: list[str]
    eligibility_requirements: EligibilityRequirements


class EligibilityStatus(StrEnum):
    ELIGIBLE = "eligible"
    INELIGIBLE = "ineligible"
    NEEDS_REVIEW = "needs_review"


class EligibilityResult(BaseModel):
    opportunity_id: str
    profile_id: int
    eligibility_status: EligibilityStatus
    reasons: list[str]


class OpportunityMatch(Opportunity):
    matched_skills: list[str]
    missing_skills: list[str]
    match_score: int
    eligibility_status: EligibilityStatus
    eligibility_reasons: list[str]


class ApplicationStatus(StrEnum):
    DRAFT = "Draft"
    READY = "Ready for Review"
    SUBMITTED = "Submitted"


class ApplicationCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    profile_id: int = Field(gt=0)
    opportunity_id: str = Field(min_length=1)


class ApplicationResponse(ApplicationCreate):
    model_config = ConfigDict(from_attributes=True)

    id: int
    status: ApplicationStatus


class DemoPreparation(BaseModel):
    application: ApplicationResponse
    demo_path: str
    command: str
