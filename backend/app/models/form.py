from datetime import datetime
from typing import List, Optional, TYPE_CHECKING
from sqlalchemy import String, DateTime, ForeignKey, Enum, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
import enum
from app.db.database import Base
from app.models.creator import generate_uuid, utc_now

if TYPE_CHECKING:
    from .creator import Creator
    from .question import Question
    from .response import Response

class FormStatus(str, enum.Enum):
    draft = "draft"
    published = "published"

class Form(Base):
    __tablename__ = "forms"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=generate_uuid)
    creator_id: Mapped[str] = mapped_column(ForeignKey("creators.id"), nullable=False)
    title: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    slug: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    status: Mapped[FormStatus] = mapped_column(Enum(FormStatus), default=FormStatus.draft, nullable=False)
    theme_config: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    thank_you_message: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now, onupdate=utc_now)

    creator: Mapped["Creator"] = relationship(back_populates="forms")
    questions: Mapped[List["Question"]] = relationship(back_populates="form", cascade="all, delete-orphan")
    responses: Mapped[List["Response"]] = relationship(back_populates="form", cascade="all, delete-orphan")
