from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.repositories.public_form_repository import PublicFormRepository
from app.schemas.public import PublicFormResponse, PublicQuestionResponse
from app.models.form import FormStatus

class PublicFormService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = PublicFormRepository(db)

    def get_public_form(self, slug: str) -> PublicFormResponse:
        form = self.repo.get_form_by_slug(slug)
        if not form:
            raise HTTPException(status_code=404, detail="Form not found")
        
        if form.status != FormStatus.published:
            raise HTTPException(status_code=404, detail="Form not found")

        active_questions = sorted([q for q in form.questions if not q.is_deleted], key=lambda q: q.order_index)

        resp = PublicFormResponse.model_validate(form)
        resp.questions = [PublicQuestionResponse.model_validate(q) for q in active_questions]
        return resp
