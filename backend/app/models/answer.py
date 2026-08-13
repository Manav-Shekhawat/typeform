from typing import Optional, TYPE_CHECKING
from sqlalchemy import String, ForeignKey, UniqueConstraint, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.database import Base
from app.models.creator import generate_uuid

if TYPE_CHECKING:
    from .response import Response
    from .question import Question

class Answer(Base):
    __tablename__ = "answers"
    __table_args__ = (
        UniqueConstraint("response_id", "question_id", name="uix_response_question"),
    )

    id: Mapped[str] = mapped_column(String, primary_key=True, default=generate_uuid)
    response_id: Mapped[str] = mapped_column(ForeignKey("responses.id"), index=True, nullable=False)
    question_id: Mapped[str] = mapped_column(ForeignKey("questions.id"), index=True, nullable=False)
    value: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    response: Mapped["Response"] = relationship(back_populates="answers")
    question: Mapped["Question"] = relationship(back_populates="answers")
