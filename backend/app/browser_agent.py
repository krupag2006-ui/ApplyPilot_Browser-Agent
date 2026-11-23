import argparse

from playwright.sync_api import Error, Page, sync_playwright

from .database import SessionLocal
from .models import Application, Profile
from .schemas import ApplicationStatus

DEMO_ORIGIN = "http://127.0.0.1:8000"


def demo_path(application_id: int) -> str:
    return f"/demo/applications/{application_id}"


def fill_demo(page: Page, application_id: int, profile: Profile) -> None:
    url = f"{DEMO_ORIGIN}{demo_path(application_id)}"

    def local_requests_only(route):
        request = route.request
        if request.url == url and request.method in {"GET", "POST"}:
            route.continue_()
        else:
            route.abort()

    page.context.route("**/*", local_requests_only)
    response = page.goto(url)
    if response is None or not response.ok or page.url != url:
        raise RuntimeError("The demo form could not load. Prepare the application and check the local API.")

    fields = {
        "Name": profile.name or "",
        "Email": profile.email or "",
        "Phone": profile.phone or "",
        "Skills": ", ".join(profile.skills),
        "Education": "\n".join(profile.education),
    }
    for label, value in fields.items():
        page.get_by_label(label, exact=True).fill(value)


def main() -> None:
    parser = argparse.ArgumentParser(description="Fill a local ApplyPilot demo form for manual review.")
    parser.add_argument("--application-id", required=True, type=int)
    args = parser.parse_args()
    with SessionLocal() as db:
        application = db.get(Application, args.application_id)
        if application is None or application.status != ApplicationStatus.READY:
            parser.exit(1, "Prepare a draft application through the local API first.\n")
        profile = db.get(Profile, application.profile_id)

    try:
        with sync_playwright() as playwright:
            try:
                browser = playwright.chromium.launch(headless=False)
            except Error:
                try:
                    browser = playwright.chromium.launch(channel="chrome", headless=False)
                except Error:
                    browser = playwright.chromium.launch(channel="msedge", headless=False)
            context = browser.new_context(service_workers="block")
            page = context.new_page()
            fill_demo(page, args.application_id, profile)
            print("Review the fields in Chromium. Click Submit local demo to submit, or close Chromium to cancel.")
            page.get_by_text("Local demo submission recorded.", exact=True).wait_for(timeout=0)
            print("Local demo submission recorded.")
            browser.close()
    except Error as exc:
        if "has been closed" in str(exc):
            print("Demo browser closed. Check the application's current status in the API.")
            return
        parser.exit(1, "Chromium could not run the demo. Check Playwright installation and local API availability.\n")
    except RuntimeError as exc:
        parser.exit(1, f"{exc}\n")


if __name__ == "__main__":
    main()
