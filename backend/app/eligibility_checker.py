import re

from .schemas import EligibilityRequirements, EligibilityStatus

DEGREES = {
    "btech": r"b\s*tech|bachelor of technology",
    "be": r"b\s*e|bachelor of engineering",
    "bsc": r"b\s*(?:sc|s)|bachelor of science",
    "bca": r"b\s*ca|bachelor of computer applications?",
    "bcom": r"b\s*com|bachelor of commerce",
    "ba": r"b\s*a|bachelor of arts",
    "mtech": r"m\s*tech|master of technology",
    "msc": r"m\s*(?:sc|s)|master of science",
    "mca": r"m\s*ca|master of computer applications?",
    "mba": r"m\s*ba|master of business administration",
    "ma": r"m\s*a|master of arts",
    "diploma": r"diploma",
    "phd": r"ph\s*d|doctor of philosophy",
}
DEGREE_PATTERNS = {key: re.compile(rf"\b(?:{pattern})\b", re.I) for key, pattern in DEGREES.items()}
YEAR = r"(?:19|20)\d{2}"
GRADUATION = re.compile(
    rf"\b(?:expected(?:\s+graduation)?|graduat\w*|complet\w*|passing|class\s+of|batch\s+of)"
    rf"\b[^\d]{{0,35}}({YEAR})\b", re.I,
)
YEAR_RANGE = re.compile(rf"\b({YEAR})\s*(?:[-–—]|to)\s*({YEAR})\b", re.I)


def check_eligibility(
    education: list[str], requirements: EligibilityRequirements,
) -> tuple[EligibilityStatus, list[str]]:
    records: list[tuple[set[str], list[str]]] = []
    for line in education:
        normalized = re.sub(r"(?<=[a-z])\.(?=[a-z])", "", line.casefold())
        degrees = {key for key, pattern in DEGREE_PATTERNS.items() if pattern.search(normalized)}
        if degrees or not records:
            records.append((degrees, [line]))
        else:
            records[-1][1].append(line)

    allowed = set(requirements.allowed_degrees)
    relevant = [lines for degrees, lines in records if not allowed or degrees & allowed]
    if allowed and not relevant:
        if any(degrees for degrees, _ in records):
            return EligibilityStatus.INELIGIBLE, ["Listed degrees do not meet the degree requirement."]
        return EligibilityStatus.NEEDS_REVIEW, ["A qualifying degree could not be verified from the resume."]

    minimum = requirements.graduation_year_min
    maximum = requirements.graduation_year_max
    if minimum is None and maximum is None:
        return EligibilityStatus.ELIGIBLE, ["Resume education meets the listed requirements."]

    uncertain = not relevant
    for lines in relevant:
        evidence = " ".join(lines)
        years = set(GRADUATION.findall(evidence))
        years.update(end for _, end in YEAR_RANGE.findall(evidence))
        if len(years) != 1:
            uncertain = True
            continue
        year = int(next(iter(years)))
        if (minimum is None or year >= minimum) and (maximum is None or year <= maximum):
            return EligibilityStatus.ELIGIBLE, ["Resume education and graduation year meet the listed requirements."]
    if uncertain:
        return EligibilityStatus.NEEDS_REVIEW, ["A graduation year for a qualifying education record could not be verified."]
    return EligibilityStatus.INELIGIBLE, ["The listed graduation year is outside the required range."]
