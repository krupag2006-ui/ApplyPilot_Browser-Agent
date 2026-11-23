import json
import re
from pathlib import Path

from .schemas import Opportunity

SKILL_ALIASES = {
    "Python": (), "Java": (), "JavaScript": ("JS",), "TypeScript": ("TS",),
    "SQL": (), "HTML": ("HTML5",), "CSS": ("CSS3",), "React": ("React.js", "ReactJS"),
    "Node.js": ("NodeJS",), "FastAPI": (), "Flask": (), "Django": (),
    "Git": (), "GitHub": (), "Docker": (), "Linux": (), "REST APIs": ("REST API", "RESTful APIs"),
    "Excel": ("Microsoft Excel",), "Power BI": (), "Tableau": (),
    "pandas": (), "NumPy": (), "scikit-learn": ("sklearn",),
    "Machine Learning": ("ML",), "Data Analysis": (), "Statistics": (),
    "PostgreSQL": ("Postgres",), "SQLite": (), "MongoDB": (), "Figma": (),
    "Playwright": (), "Selenium": (), "pytest": (), "C++": (), "C#": (),
    "Go": ("Golang",), "Rust": (), "Kotlin": (), "Swift": (),
    "AWS": ("Amazon Web Services",), "Azure": (), "Bash": (),
}


def skill_key(skill: str) -> str:
    return " ".join(skill.casefold().split())


CANONICAL_SKILLS = {
    skill_key(spelling): skill
    for skill, aliases in SKILL_ALIASES.items()
    for spelling in (skill, *aliases)
}
SKILL_PATTERN = re.compile(
    r"(?<![\w+#])(" + "|".join(
        re.escape(spelling).replace(r"\ ", r"\s+")
        for spelling in sorted(CANONICAL_SKILLS, key=len, reverse=True)
    ) + r")(?![\w+#]|\.[a-z])", re.IGNORECASE,
)


def extract_skills(text: str) -> list[str]:
    skills = (CANONICAL_SKILLS[skill_key(match[0])] for match in SKILL_PATTERN.finditer(text))
    return list(dict.fromkeys(skills))


def match_skills(profile_skills: list[str], required_skills: list[str]) -> tuple[list[str], list[str], int]:
    def normalize(skill: str) -> str:
        key = skill_key(skill)
        return skill_key(CANONICAL_SKILLS.get(key, key))

    available = {normalize(skill) for skill in profile_skills}
    required = {}
    for skill in required_skills:
        required.setdefault(normalize(skill), skill)
    matched = [skill for key, skill in required.items() if key in available]
    missing = [skill for key, skill in required.items() if key not in available]
    score = round(100 * len(matched) / len(required)) if required else 100
    return matched, missing, score


def load_opportunities() -> dict[str, Opportunity]:
    path = Path(__file__).resolve().parents[2] / "sample_data" / "opportunities.json"
    opportunities = [Opportunity.model_validate(item) for item in json.loads(path.read_text(encoding="utf-8"))]
    return {item.id: item for item in opportunities}
