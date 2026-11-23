# ApplyPilot backend

ApplyPilot extracts profiles from text-based PDF resumes, ranks ten fictional internship listings, and fills a local demo application form. Matching and eligibility use deterministic rules and require no API keys. SQLite stores parsed profiles, application statuses, and submitted demo fields.

## Setup

Use Python 3.11 or later. From the repository root in PowerShell:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

On macOS or Linux, use `source .venv/bin/activate` for activation. If PowerShell blocks activation, use `.\.venv\Scripts\python.exe` in place of `python`.

The API creates `backend/applypilot.sqlite3` at startup. To override it or the upload limit, export the variables documented in [.env.example](.env.example) before starting the server. The API and demo CLI must use the same database URL. Use fictitious data and keep the service on loopback. This MVP has no sign-in or per-user access control. Parsed data persists in SQLite until you remove it. The API does not retain the original PDF or log resume fields.

Swagger UI is at http://127.0.0.1:8000/docs, ReDoc at http://127.0.0.1:8000/redoc, and the OpenAPI JSON at http://127.0.0.1:8000/openapi.json. These are bodyless GET requests that return HTML, HTML, and JSON respectively.

## React integration

Run the React dev server on `http://localhost:5173` or `http://127.0.0.1:5173`. Use `http://127.0.0.1:8000` as the API base URL. Keep the returned `profile_id` in frontend state and pass it in each profile-specific call. The following wrapper supports the requests below:

```js
const apiBase = "http://127.0.0.1:8000";
async function api(path, options) {
  const response = await fetch(`${apiBase}${path}`, options);
  const body = await response.json();
  if (!response.ok) {
    throw new Error(Array.isArray(body.detail)
      ? body.detail.map((item) => item.msg).join("; ")
      : body.detail ?? `HTTP ${response.status}`);
  }
  return body;
}
```

### `POST /api/resume/upload`

Send a multipart field named `file`. Let the browser set the multipart Content-Type and boundary. The default size limit is 5 MiB, with a separate 25-page limit.

```js
const form = new FormData();
form.append("file", selectedPdf);
const profile = await api("/api/resume/upload", { method: "POST", body: form });
const profileId = profile.profile_id;
```

HTTP 201 example. Missing name, email, or phone is returned as `null`. Missing education or skills is returned as an empty array.

```json
{"profile_id":1,"name":"Alex Example","email":"alex@example.com","phone":"+91 98765 43210","education":["B.Tech in Computer Science","Expected Graduation: 2027"],"skills":["Python","Git"]}
```

### `GET /api/opportunities`

```js
const opportunities = await api("/api/opportunities");
```

HTTP 200 example showing one of the ten entries:

```json
[
  {"id":"backend-intern","company":"Pebblewing Systems (Fictional)","role":"Backend Engineering Intern","location":"Remote (India)","deadline":"2027-06-15","required_skills":["Python","FastAPI","SQL","Git"],"eligibility_requirements":{"allowed_degrees":["btech","be","bca","mca"],"graduation_year_min":2025,"graduation_year_max":2028}}
]
```

### `GET /api/opportunities/matches?profile_id=1`

```js
const matches = await api(`/api/opportunities/matches?profile_id=${profileId}`);
```

HTTP 200 example showing one result. Results are ordered by descending skill score, then by opportunity ID.

```json
[
  {"id":"backend-intern","company":"Pebblewing Systems (Fictional)","role":"Backend Engineering Intern","location":"Remote (India)","deadline":"2027-06-15","required_skills":["Python","FastAPI","SQL","Git"],"eligibility_requirements":{"allowed_degrees":["btech","be","bca","mca"],"graduation_year_min":2025,"graduation_year_max":2028},"matched_skills":["Python","Git"],"missing_skills":["FastAPI","SQL"],"match_score":50,"eligibility_status":"eligible","eligibility_reasons":["Resume education and graduation year meet the listed requirements."]}
]
```

The score is the rounded percentage of distinct required skills found after normalization. Show it as a recommendation and display eligibility separately. Deadlines are display fields in this fictional catalog.

### `GET /api/opportunities/{opportunity_id}/eligibility?profile_id=1`

```js
const opportunityId = "backend-intern";
const eligibility = await api(
  `/api/opportunities/${encodeURIComponent(opportunityId)}/eligibility?profile_id=${profileId}`
);
```

HTTP 200 example:

```json
{"opportunity_id":"backend-intern","profile_id":1,"eligibility_status":"eligible","reasons":["Resume education and graduation year meet the listed requirements."]}
```

Values are `eligible`, `ineligible`, and `needs_review`. Display `reasons` for all results. Eligibility is based only on the education evidence the parser recognized and the listing's degree and graduation-year requirements.

### `POST /api/applications`

```js
const application = await api("/api/applications", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ profile_id: profileId, opportunity_id: opportunityId })
});
```

HTTP 201 example:

```json
{"id":1,"profile_id":1,"opportunity_id":"backend-intern","status":"Draft"}
```

Create takes only `profile_id` and `opportunity_id`. Duplicate applications for the same pair return HTTP 409. Retrieve the existing record from the application list when that happens.

### `GET /api/applications?profile_id=1`

```js
const applications = await api(`/api/applications?profile_id=${profileId}`);
```

HTTP 200 example. An existing profile with no applications returns `[]`.

```json
[{"id":1,"profile_id":1,"opportunity_id":"backend-intern","status":"Draft"}]
```

### `POST /api/applications/{application_id}/demo/prepare`

```js
const prepared = await api(`/api/applications/${application.id}/demo/prepare`, {
  method: "POST"
});
```

HTTP 200 example:

```json
{"application":{"id":1,"profile_id":1,"opportunity_id":"backend-intern","status":"Ready for Review"},"demo_path":"/demo/applications/1","command":"python -m app.browser_agent --application-id 1"}
```

This changes a draft to `Ready for Review`. Repeat calls return the same ready state until submission. Show the command to the operator. React can refresh the application list after the operator completes the demo.

### `GET /demo/applications/{application_id}`

A direct navigation to `http://127.0.0.1:8000/demo/applications/1` requests an empty review form for a prepared application. HTTP 200 returns an HTML page titled **ApplyPilot local demo** with fields for Name, Email, Phone, Skills, and Education. The Playwright CLI opens this page and fills it from SQLite. React does not need to fetch or embed this page.

### `POST /demo/applications/{application_id}`

The browser sends an `application/x-www-form-urlencoded` request only when the operator clicks **Submit local demo**. Example request body:

```text
token=<value-from-the-form>&name=Alex+Example&email=alex%40example.com&phone=&skills=Python%2C+Git&education=B.Tech
```

HTTP 200 returns an HTML confirmation reading **Local demo submission recorded.** The server stores the reviewed fields and changes the application to `Submitted` in the same transaction. React uses the application list for confirmation.

### Errors

API errors use a `detail` property. For example, an unknown profile returns HTTP 404 with `{"detail":"Profile not found."}`. FastAPI request validation returns HTTP 422 with a `detail` array of field issues. Upload errors include 413 for size, 415 for unsupported type or signature, and 422 for unreadable, scanned, encrypted, or overlong PDFs. Demo conflicts return 409 and invalid form tokens return 403.

## Run the browser demo

1. With the virtual environment active, install Chromium with `python -m playwright install chromium`. On Linux, use `python -m playwright install --with-deps chromium` if system libraries are missing.
2. Start the API on `127.0.0.1:8000`. Upload a fictional resume, create an application, and prepare it using Swagger or React.
3. Open a second terminal in `backend/`, activate the same environment, and run the command returned by the prepare endpoint:

   ```powershell
   python -m app.browser_agent --application-id 1
   ```

4. Review and edit the fields in the Chromium window. Click **Submit local demo** to record the submission. To cancel, close the window before clicking submit. If Chromium is unavailable, open the returned `demo_path` directly and fill the form manually.

This flow targets only the local demo form. The CLI launches a browser on the machine where it runs. No job portal receives the submission.

## Tests and troubleshooting

```powershell
python -m pytest -q -rs
```

Run from `backend/`. Tests generate synthetic PDFs and use temporary SQLite databases. The browser test requires Chromium and permission to open a loopback socket. If Chromium is absent, pytest reports the smoke test as skipped. Use `python -m pytest -q -rs -k "not browser"` to run only backend tests.

- **No selectable text.** Export the source resume as a text PDF or run OCR before uploading. The parser does not include its own OCR engine.
- **Unexpected fields or `needs_review`.** The parser recognizes common degree names, skills, and year patterns. Check the extracted education and the returned reasons before relying on an eligibility result.
- **Browser download or launch fails.** Run the Chromium install command from the same Python environment. If you set `PLAYWRIGHT_BROWSERS_PATH` during installation, set the same value before running the demo or tests.
- **pytest cannot write to the Windows temporary folder.** Run `python -m pytest -q -rs --basetemp .pytest_cache/runtime` from `backend/`.
- **Demo form will not open.** Check that Uvicorn is bound to `127.0.0.1:8000`, that the application is ready, and that the CLI and API are pointed at the same SQLite file.
