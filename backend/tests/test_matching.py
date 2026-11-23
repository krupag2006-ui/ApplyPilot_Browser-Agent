import pytest

from app.eligibility_checker import check_eligibility
from app.opportunity_matcher import extract_skills, match_skills
from app.schemas import EligibilityRequirements


def test_matching_normalizes_aliases_and_deduplicates():
    assert extract_skills("JavaScript, React.js, C++, C#, Node.js. Microsoft Excel.") == [
        "JavaScript", "React", "C++", "C#", "Node.js", "Excel",
    ]
    assert extract_skills("JavaScript, GitHub, MySQL") == ["JavaScript", "GitHub"]
    assert match_skills([" js ", "PYTHON"], ["JavaScript", "JS", "Python", "SQL"]) == (
        ["JavaScript", "Python"], ["SQL"], 67,
    )
    assert match_skills([], []) == ([], [], 100)


@pytest.mark.parametrize(("education", "status"), [
    ([], "needs_review"),
    (["B.Tech in Computer Science", "Example College"], "needs_review"),
    (["B.Tech", "Expected Graduation: 2027"], "eligible"),
    (["B.Tech, 2022–2026"], "eligible"),
    (["B.Tech", "Graduated 2023"], "ineligible"),
    (["B.A. in English, Class of 2027"], "ineligible"),
    (["B.Tech", "B.A. in English, Class of 2027"], "needs_review"),
    (["B.Tech", "Expected 2027", "Expected 2029"], "needs_review"),
])
def test_eligibility(education, status):
    requirements = EligibilityRequirements(
        allowed_degrees=["btech"], graduation_year_min=2025, graduation_year_max=2028,
    )
    result, reasons = check_eligibility(education, requirements)
    assert result == status
    assert reasons
