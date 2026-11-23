from sqlalchemy import JSON, Enum, ForeignKey, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from .database import Base
from .schemas import ApplicationStatus


class Profile(Base):
    __tablename__ = "profiles"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str | None] = mapped_column(String)
    email: Mapped[str | None] = mapped_column(String)
    phone: Mapped[str | None] = mapped_column(String)
    education: Mapped[list[str]] = mapped_column(JSON)
    skills: Mapped[list[str]] = mapped_column(JSON)


class Application(Base):
    __tablename__ = "applications"
    __table_args__ = (UniqueConstraint("profile_id", "opportunity_id"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    profile_id: Mapped[int] = mapped_column(ForeignKey("profiles.id"), index=True)
    opportunity_id: Mapped[str] = mapped_column(String)
    status: Mapped[ApplicationStatus] = mapped_column(
        Enum(ApplicationStatus, values_callable=lambda members: [item.value for item in members],
             native_enum=False, create_constraint=True),
        default=ApplicationStatus.DRAFT,
    )
    submitted_form: Mapped[str | None] = mapped_column(Text)
