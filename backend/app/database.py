import os
from pathlib import Path

from sqlalchemy import create_engine, event
from sqlalchemy.orm import DeclarativeBase, sessionmaker


class Base(DeclarativeBase):
    pass


def make_engine(url: str):
    engine = create_engine(url)
    if engine.dialect.name == "sqlite":
        @event.listens_for(engine, "connect")
        def enable_foreign_keys(connection, _record):
            connection.execute("PRAGMA foreign_keys=ON")
    return engine


default_db = Path(__file__).resolve().parents[1] / "applypilot.sqlite3"
engine = make_engine(os.getenv("APPLY_PILOT_DATABASE_URL", f"sqlite:///{default_db.as_posix()}"))
SessionLocal = sessionmaker(bind=engine, expire_on_commit=False)


def get_db():
    with SessionLocal() as session:
        yield session
