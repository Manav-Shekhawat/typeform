from datetime import datetime
from typing import List, TYPE_CHECKING
from sqlalchemy import String, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.database import Base
from app.models.creator import generate_uuid, utc_now

if TYPE_CHECKING:
    from .form import Form
    from .answer import Answer

class Response(Base):
    __tablename__ = "responses"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=generate_uuid)
    form_id: Mapped[str] = mapped_column(ForeignKey("forms.id"), index=True, nullable=False)
    submitted_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now, nullable=False)

    form: Mapped["Form"] = relationship(back_populates="responses")
    answers: Mapped[List["Answer"]] = relationship(back_populates="response", cascade="all, delete-orphan")
