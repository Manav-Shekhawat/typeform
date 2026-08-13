from sqlalchemy.orm import Session
from app.models.question import Question

class QuestionRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_question_by_id_and_form(self, question_id: str, form_id: str) -> Question | None:
        return self.db.query(Question).filter(
            Question.id == question_id,
            Question.form_id == form_id
        ).first()
    
    def create_question(self, form_id: str, data: dict) -> Question:
        q = Question(form_id=form_id, **data)
        self.db.add(q)
        self.db.flush()
        return q

    def update_question(self, q: Question, data: dict) -> Question:
        for k, v in data.items():
            setattr(q, k, v)
        self.db.flush()
        return q

    def soft_delete_question(self, q: Question):
        q.is_deleted = True
        self.db.flush()

    def get_active_questions_in_form(self, form_id: str) -> list[Question]:
        return self.db.query(Question).filter(
            Question.form_id == form_id,
            Question.is_deleted == False
        ).all()
