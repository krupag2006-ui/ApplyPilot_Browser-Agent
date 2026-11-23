import socket
import threading
from pathlib import Path
from time import monotonic, sleep

import httpx
import pytest
import uvicorn
from playwright.sync_api import sync_playwright

from app import browser_agent, main
from app.models import Profile
from conftest import upload


def test_browser_fills_and_waits_for_manual_submission(database, demo_pdf, monkeypatch):
    with sync_playwright() as playwright:
        use_channel = None
        if not Path(playwright.chromium.executable_path).exists():
            if Path(r"C:\Program Files\Google\Chrome\Application\chrome.exe").exists():
                use_channel = "chrome"
            else:
                pytest.skip("Playwright Chromium is unavailable. Run python -m playwright install chromium.")
        with socket.socket() as listener:
            listener.bind(("127.0.0.1", 0))
            origin = f"http://127.0.0.1:{listener.getsockname()[1]}"
            monkeypatch.setattr(browser_agent, "DEMO_ORIGIN", origin)
            server = uvicorn.Server(uvicorn.Config(main.app, log_level="error"))
            thread = threading.Thread(target=server.run, kwargs={"sockets": [listener]}, daemon=True)
            thread.start()
            try:
                deadline = monotonic() + 10
                while not server.started and thread.is_alive() and monotonic() < deadline:
                    sleep(0.05)
                assert server.started
                with httpx.Client(base_url=origin, trust_env=False) as client:
                    profile_id = upload(client, demo_pdf).json()["profile_id"]
                    created = client.post("/api/applications", json={
                        "profile_id": profile_id, "opportunity_id": "backend-intern",
                    })
                    application_id = created.json()["id"]
                    assert client.post(f"/api/applications/{application_id}/demo/prepare").status_code == 200
                    with database() as db:
                        profile = db.get(Profile, profile_id)

                    browser = playwright.chromium.launch(channel=use_channel) if use_channel else playwright.chromium.launch()
                    page = browser.new_context(service_workers="block").new_page()
                    browser_agent.fill_demo(page, application_id, profile)
                    assert page.get_by_label("Name").input_value() == profile.name
                    assert page.get_by_label("Email").input_value() == profile.email
                    assert page.get_by_label("Phone").input_value() == profile.phone
                    assert page.get_by_label("Skills").input_value() == ", ".join(profile.skills)
                    assert page.get_by_label("Education").input_value() == "\n".join(profile.education)
                    url = f"/api/applications?profile_id={profile_id}"
                    assert client.get(url).json()[0]["status"] == "Ready for Review"
                    page.get_by_role("button", name="Submit local demo").click()
                    page.get_by_text("Local demo submission recorded.", exact=True).wait_for()
                    assert client.get(url).json()[0]["status"] == "Submitted"
                    browser.close()
            finally:
                server.should_exit = True
                thread.join(timeout=10)
                assert not thread.is_alive()
