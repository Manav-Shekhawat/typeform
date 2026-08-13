from sqlalchemy.orm import Session
from app.models.response import Response
from app.models.answer import Answer

class ResponseRepository:
    def __init__(self, db: Session):
        self.db = db

    def create_response(self, form_id: str, answers_data: list[dict]) -> Response:
        db_response = Response(form_id=form_id)
        self.db.add(db_response)
        self.db.flush()

        for ans in answers_data:
            db_answer = Answer(
                response_id=db_response.id,
                question_id=ans["question_id"],
                value=ans["value"]
            )
            self.db.add(db_answer)

        self.db.commit()
        self.db.refresh(db_response)
        return db_response
