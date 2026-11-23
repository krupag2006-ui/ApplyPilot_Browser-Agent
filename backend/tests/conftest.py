import pymupdf
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import sessionmaker

from app import main
from app.database import make_engine


@pytest.fixture
def demo_pdf():
    with pymupdf.open() as pdf:
        page = pdf.new_page()
        page.insert_text(
            (60, 65),
            "Alex Example\nAlex.Example@example.com\n+91 98765 43210\n"
            "Education\nB.Tech in Computer Science\nExpected Graduation: 2027\n"
            "Technical Skills\nPython, FastAPI, SQL, Git, ReactJS, C++",
        )
        return pdf.tobytes()


@pytest.fixture
def database(tmp_path, monkeypatch):
    engine = make_engine(f"sqlite:///{(tmp_path / 'test.sqlite3').as_posix()}")
    sessions = sessionmaker(bind=engine, expire_on_commit=False)
    monkeypatch.setattr(main, "engine", engine)

    def get_test_db():
        with sessions() as db:
            yield db

    main.app.dependency_overrides[main.get_db] = get_test_db
    try:
        yield sessions
    finally:
        main.app.dependency_overrides.clear()
        engine.dispose()


@pytest.fixture
def client(database):
    with TestClient(main.app) as test_client:
        yield test_client


def upload(client, pdf):
    return client.post("/api/resume/upload", files={"file": ("sample.pdf", pdf, "application/pdf")})


@pytest.fixture
def profile(client, demo_pdf):
    response = upload(client, demo_pdf)
    assert response.status_code == 201, response.text
    return response.json()
