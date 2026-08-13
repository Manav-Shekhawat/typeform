from sqlalchemy.orm import Session
from app.repositories.form_repository import FormRepository, get_default_creator
from app.schemas.form import FormCreate, FormUpdate, FormDetailResponse
from app.schemas.question import QuestionResponse
from fastapi import HTTPException

class FormService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = FormRepository(db)

    def _get_creator_id(self) -> str:
        creator = get_default_creator(self.db)
        return creator.id

    def list_forms(self):
        creator_id = self._get_creator_id()
        forms = self.repo.get_forms_by_creator(creator_id)
        result = []
        for form in forms:
            setattr(form, "response_count", self.repo.count_responses(form.id))
            result.append(form)
        return result

    def get_form(self, form_id: str):
        creator_id = self._get_creator_id()
        form = self.repo.get_form_by_id_and_creator(form_id, creator_id)
        if not form:
            raise HTTPException(status_code=404, detail="Form not found")
            
        setattr(form, "response_count", self.repo.count_responses(form.id))
        resp = FormDetailResponse.model_validate(form)
        
        active_questions = sorted([q for q in form.questions if not q.is_deleted], key=lambda q: q.order_index)
        resp.questions = [QuestionResponse.model_validate(q) for q in active_questions]
        return resp

    def create_form(self, form_in: FormCreate):
        creator_id = self._get_creator_id()
        form = self.repo.create_form(creator_id, form_in.title, form_in.description)
        setattr(form, "response_count", 0)
        return form

    def update_form(self, form_id: str, form_in: FormUpdate):
        creator_id = self._get_creator_id()
        form = self.repo.get_form_by_id_and_creator(form_id, creator_id)
        if not form:
            raise HTTPException(status_code=404, detail="Form not found")
        form = self.repo.update_form(form, form_in.title, form_in.description)
        
        setattr(form, "response_count", self.repo.count_responses(form.id))
        resp = FormDetailResponse.model_validate(form)
        
        active_questions = sorted([q for q in form.questions if not q.is_deleted], key=lambda q: q.order_index)
        resp.questions = [QuestionResponse.model_validate(q) for q in active_questions]
        return resp

    def delete_form(self, form_id: str):
        creator_id = self._get_creator_id()
        form = self.repo.get_form_by_id_and_creator(form_id, creator_id)
        if not form:
            raise HTTPException(status_code=404, detail="Form not found")
        self.repo.delete_form(form)

    def duplicate_form(self, form_id: str):
        creator_id = self._get_creator_id()
        form = self.repo.get_form_by_id_and_creator(form_id, creator_id)
        if not form:
            raise HTTPException(status_code=404, detail="Form not found")
        
        new_form = self.repo.duplicate_form(form)
        setattr(new_form, "response_count", 0)
        resp = FormDetailResponse.model_validate(new_form)
        
        active_questions = sorted([q for q in new_form.questions if not q.is_deleted], key=lambda q: q.order_index)
        resp.questions = [QuestionResponse.model_validate(q) for q in active_questions]
        return resp
