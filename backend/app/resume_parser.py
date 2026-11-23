import re

import pymupdf

from .opportunity_matcher import extract_skills

EMAIL = re.compile(r"[\w.+-]+@[\w-]+(?:\.[\w-]+)+")
PHONE = re.compile(r"(?<![\w+])\+?\d(?:[\d ()\-.]{7,22})\d(?!\w)")
EDUCATION = re.compile(r"\b(?:b\.?\s?(?:tech|e|sc|ca|s|a|com)|m\.?\s?(?:tech|sc|ca|s|a|ba)|ph\.?d|bachelor|master|diploma|degree|university|college)\b", re.I)
SECTION = re.compile(
    r"^(education|academic (?:background|qualifications)|skills|technical skills|experience|"
    r"work experience|projects|certifications|summary|profile|achievements|interests|languages|"
    r"professional experience|internships|awards|publications|contact)\s*:?$", re.I,
)
MAX_PAGES = 25


class ResumeError(ValueError):
    pass


def parse_pdf(data: bytes) -> dict:
    if not data.startswith(b"%PDF-"):
        raise ResumeError("File contents are not a PDF.")
    try:
        with pymupdf.open(stream=data, filetype="pdf") as pdf:
            if pdf.needs_pass:
                raise ResumeError("Upload an unencrypted PDF.")
            if len(pdf) > MAX_PAGES:
                raise ResumeError(f"Resume PDFs may have at most {MAX_PAGES} pages.")
            content = "\n".join(page.get_text(sort=True) for page in pdf)
    except (pymupdf.FileDataError, RuntimeError) as exc:
        raise ResumeError("The PDF could not be read.") from exc
    if not any(char.isalnum() for char in content):
        raise ResumeError("No selectable text found. Upload a text-based PDF or run OCR first.")

    lines = [" ".join(line.split()) for line in content.splitlines() if line.strip()]
    name = None
    for line in lines[:8]:
        candidate = re.sub(r"^name\s*:\s*", "", line, flags=re.I)
        words = candidate.split()
        if SECTION.fullmatch(line):
            break
        if (2 <= len(words) <= 5 and not EDUCATION.search(candidate)
                and not re.search(r"\b(resume|curriculum vitae|developer|engineer|student|"
                                  r"analyst|designer|intern|graduate)\b", candidate, re.I)
                and all(word.replace(".", "").replace("-", "").replace("'", "")
                        .replace("’", "").isalpha() for word in words)):
            name = candidate
            break

    email = EMAIL.search(content)
    phone = next((match[0] for line in lines[:18] for match in PHONE.finditer(line)
                  if 10 <= sum(char.isdigit() for char in match[0]) <= 15), None)
    education = []
    education_section = False
    for line in lines:
        heading = SECTION.fullmatch(line)
        if heading:
            education_section = heading[1].casefold() in {
                "education", "academic background", "academic qualifications"
            }
            continue
        if education_section or EDUCATION.search(line):
            education.append(line)

    return {
        "name": name, "email": email[0] if email else None, "phone": phone,
        "education": list(dict.fromkeys(education)), "skills": extract_skills(content),
    }
