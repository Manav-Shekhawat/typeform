from typing import List, Optional, Any, TYPE_CHECKING
from sqlalchemy import String, ForeignKey, Enum, JSON, Boolean, Integer, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
import enum
from app.db.database import Base
from app.models.creator import generate_uuid

if TYPE_CHECKING:
    from .form import Form
    from .answer import Answer

class QuestionType(str, enum.Enum):
    SHORT_TEXT = "SHORT_TEXT"
    LONG_TEXT = "LONG_TEXT"
    MULTIPLE_CHOICE = "MULTIPLE_CHOICE"
    DROPDOWN = "DROPDOWN"
    EMAIL = "EMAIL"
    NUMBER = "NUMBER"
    YES_NO = "YES_NO"
    RATING = "RATING"

class Question(Base):
    __tablename__ = "questions"
    __table_args__ = (
        UniqueConstraint("form_id", "order_index", name="uix_form_order"),
    )

    id: Mapped[str] = mapped_column(String, primary_key=True, default=generate_uuid)
    form_id: Mapped[str] = mapped_column(ForeignKey("forms.id"), index=True, nullable=False)
    type: Mapped[QuestionType] = mapped_column(Enum(QuestionType), nullable=False)
    title: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    is_required: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    order_index: Mapped[int] = mapped_column(Integer, nullable=False)
    properties: Mapped[Optional[dict[str, Any]]] = mapped_column(JSON, nullable=True)
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    form: Mapped["Form"] = relationship(back_populates="questions")
    answers: Mapped[List["Answer"]] = relationship(back_populates="question") 
    # Notice: NO cascade="all, delete-orphan" for answers because we soft-delete questions to preserve history.
