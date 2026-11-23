# ApplyPilot – Your Intelligent Application Agent

 HEAD
**One Profile. Multiple Opportunities. Smarter Applications.**

## About the Project

ApplyPilot is an AI-powered autonomous browser agent designed to simplify the process of applying for internships, jobs, scholarships, and other opportunities.

It understands user profiles, discovers relevant opportunities, evaluates eligibility, and assists with repetitive application tasks through browser automation.

## Problem Statement

Students and fresh graduates often face repetitive application procedures across multiple websites, including entering personal details, uploading resumes, checking eligibility, and tracking deadlines.

ApplyPilot aims to simplify this fragmented process through an intelligent, user-controlled application assistant.

## Key Features

- Resume parsing and profile creation.
- AI-powered opportunity matching.
- Eligibility checking.
- Automated application form filling.
- User approval before final submission.
- Centralized application tracking.

## Technology Stack

- Frontend: React.js, Tailwind CSS
- Backend: Python, FastAPI
- AI/ML: NLP and LLM APIs
- Browser Automation: Playwright
- Database: SQLite
- Document Processing: PyMuPDF

## System Workflow

1. User uploads their resume.
2. ApplyPilot extracts profile information.
3. Relevant opportunities are identified.
4. AI evaluates eligibility.
5. Browser agent assists with form filling.
6. User reviews and approves the application.
7. Application details are tracked.

## Project Structure

- frontend/ – User interface
- backend/ – API and AI logic
- sample_data/ – Sample opportunities
- screenshots/ – Project screenshots
- docs/ – Technical documentation

## Current Status

Early-stage prototype / MVP under development.

Implemented features: [Update with actual completed features.]

Planned features: Advanced cross-platform browser automation, intelligent form mapping, and expanded opportunity discovery.

## Privacy and Security

ApplyPilot aims to keep users in control of their personal information and application submissions. Sensitive information should not be shared without user consent.

## Future Scope

- Integration with multiple opportunity platforms.
- Personalized resume recommendations.
- Scholarship and fellowship discovery.
- Email and deadline notifications.
- Advanced AI-powered application assistance.

---

**ApplyPilot – Spend less time applying. More time growing.**
=======
> **"Less Applying. More Achieving."**  
> An intelligent application copilot engineered for students and fresh graduates. Upload your resume once, discover high-compatibility roles, verify eligibility transparently, autofill application forms with browser automation, and track your application pipeline — keeping human judgement at every critical decision.

---

## 👥 Team
- **Krupa G** — Frontend Engineering, UI/UX Architecture, and Full-Stack Integration
- **Harshitha** — Backend API Architecture, Database Models, and Parser Engine

---

## 🎯 The Problem ApplyPilot Solves

During internship and placement seasons, students repeatedly fill identical forms on dozens of portals:
- Re-typing their name, contact details, graduation years, degree titles, and skill lists.
- Applying to roles where they are disqualified due to unstated degree or graduation year constraints.
- Losing track of which opportunities have been submitted, reviewed, or drafted.
- Facing black-box AI tools that fabricate applicant experience or submit forms autonomously without human consent.

**ApplyPilot fixes this with:**
1. **Deterministic Resume Extraction**: Extracts text, degrees, graduation years, and skills from PDF resumes without third-party ad networks or hallucinating models.
2. **Transparent Eligibility Checking**: Compares education and degree requirements deterministically, presenting clear reasons for every qualification status.
3. **Playwright Browser Agent Assistant**: Autofills application forms automatically, saving hundreds of keystrokes while requiring explicit human confirmation before submission.
4. **Persistent SQLite Pipeline**: Tracks every draft and submission locally with HMAC verification tokens.

---

## 🎨 UI/UX Design Direction

ApplyPilot intentionally departs from generic SaaS dashboard patterns (no purple/blue gradients, no neon glassmorphism, no generic robot icons). Instead, it adopts a **warm, editorial, human-friendly aesthetic**:
- **Palette**: Warm ivory (`#FBF9F5`) and cream backgrounds, deep forest green (`#1C3A2F`) as primary, muted terracotta (`#C86343`) as accent, and dark charcoal (`#212529`) typography.
- **Typography**: Editorial serif headings (*Playfair Display*) paired with clean, highly readable body typography (*Plus Jakarta Sans*).
- **Interactions**: Thoughtful whitespace, card elevations, clear progress indicators, and celebratory completion feedback.
- **Responsive**: Fully optimized for desktop, laptop, and tablet viewing.

---

## 🏗️ Architecture

```
ApplyPilot/
├── backend/                  # FastAPI Application
│   ├── app/
│   │   ├── main.py           # FastAPI routes, CORS, and demo form endpoints
│   │   ├── models.py         # SQLAlchemy models (Profile, Application)
│   │   ├── schemas.py        # Pydantic schemas and enums
│   │   ├── database.py       # SQLite connection and session maker
│   │   ├── resume_parser.py  # PyMuPDF text and degree/skill extractor
│   │   ├── opportunity_matcher.py # Canonical skill aliases and scoring
│   │   ├── eligibility_checker.py # Deterministic degree & year validation
│   │   └── browser_agent.py  # Playwright browser automation agent
│   ├── tests/                # Pytest test suite (14 test cases + E2E)
│   ├── requirements.txt      # Python dependencies
│   └── README_BACKEND.md     # Backend specifications
│
├── frontend/                 # React + Vite + Tailwind CSS Application
│   ├── src/
│   │   ├── api/client.js     # Centralized API service
│   │   ├── context/AppContext.jsx # Global reactive state & persistence
│   │   ├── components/       # Navbar, Footer, StatusBadge, UploadModal, Toasts
│   │   ├── pages/            # Landing, Dashboard, Opportunities, Assistant, Tracker, Profile
│   │   ├── App.jsx           # Routing configuration
│   │   └── main.jsx          # React DOM entry point
│   ├── package.json          # Node dependencies
│   ├── vite.config.js        # Vite build & dev server config
│   └── tailwind.config.js    # Custom color tokens & fonts
│
└── sample_data/
    └── opportunities.json    # 10 realistic fictional internship opportunities
```

---

## 🚀 Quickstart Guide

### Prerequisites
- **Python 3.11+** (tested on Python 3.13)
- **Node.js 18+** (tested on Node v24)
- **Google Chrome** or **Microsoft Edge** (for Playwright browser automation)

### 1. Start the FastAPI Backend

Open a terminal in the project root:

```powershell
cd backend
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

- Backend API: `http://127.0.0.1:8000`
- Swagger Documentation: `http://127.0.0.1:8000/docs`
- ReDoc: `http://127.0.0.1:8000/redoc`

### 2. Start the React Frontend

Open a second terminal in the project root:

```powershell
cd frontend
npm install
npm run dev
```

- Open your browser to: **`http://localhost:5173`** or **`http://127.0.0.1:5173`**

---

## 🧪 Testing the Application

### Running Backend Tests
From the `backend/` directory:

```powershell
python -m pytest -v
```

*Results: 14 passed (100% test coverage including API lifecycle, PDF rejections, skill alias normalization, degree eligibility patterns, and Playwright browser fill).*

### Running End-to-End Integration Test
From the `backend/` directory:

```powershell
python -m tests.test_e2e_integration
```

*Executes a full 10-step simulated student journey against an active loopback FastAPI server.*

---

## 🌟 The Complete User Journey

1. **Visit Landing Page**: Explore the value proposition, workflow, and product preview at `http://localhost:5173`.
2. **Upload Resume**: Click **Get Started** or **Upload Resume** to drag-and-drop a text-based PDF (or click **Load Demo PDF** for 1-click testing).
3. **Review Extracted Profile**: View recognized full name, contact email, phone, degree records, and technical skills. Save to store in SQLite.
4. **Discover Opportunities**: Browse 10 curated positions with instant match scores, matching skills chips, and missing skills alerts.
5. **Inspect AI Eligibility**: Click **Inspect Eligibility** to review degree verification reasons and graduation year compatibility.
6. **Autofill Application**: Click **Apply with Assistant** to launch the browser assistant. Watch the field-by-field checklist populate.
7. **Explicit Review & Approval**: Review populated inputs, edit any field if needed, check the explicit approval authorization box, and submit.
8. **Track Status**: Visit the **Application Tracker** to monitor your submission history.

---

## 🔒 Responsible Automation & Ethical Safeguards

- **No Unconsented Submissions**: ApplyPilot *never* submits an application automatically without the student's explicit review and checkbox confirmation.
- **Tamper-Proof Tokens**: Every demo review form is secured with an HMAC token derived from the backend secret.
- **Zero Hallucination Guarantee**: Match percentages and degree compatibilities are computed deterministically against explicit regex patterns and alias dictionaries.
- **Privacy First**: Original PDF files are parsed in memory and discarded; no sensitive files are retained on external servers.

---

## 📄 License
Created for academic and ideathon showcase.
All rights reserved © 2026 Krupa & Harshitha.
>>>>>>> b288331 (ApplyPilot  MVP)
