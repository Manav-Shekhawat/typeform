from sqlalchemy.orm import Session, joinedload
from app.models.response import Response
from app.models.answer import Answer

class ResultsRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_responses_by_form_id(self, form_id: str) -> list[Response]:
        # Eager load answers to avoid N+1 queries
        return (
            self.db.query(Response)
            .filter(Response.form_id == form_id)
            .options(joinedload(Response.answers))
            .order_by(Response.submitted_at.desc())
            .all()
        )

    def get_response_by_id_and_form(self, response_id: str, form_id: str) -> Response | None:
        return (
            self.db.query(Response)
            .filter(Response.id == response_id, Response.form_id == form_id)
            .options(joinedload(Response.answers))
            .first()
        )
