from datetime import datetime
from sqlalchemy.orm import Session
from app.repositories.form_repository import FormRepository, get_default_creator
from app.schemas.form import FormCreate, FormUpdate, FormDetailResponse
from app.schemas.question import QuestionResponse
from app.models.form import FormStatus
from app.services.question_service import QuestionService
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
        
        active_questions = sorted([q for q in form.questions if not q.is_deleted], key=lambda q: q.order_index)
        
        # Build the response directly to avoid validating deleted questions
        resp = FormDetailResponse(
            **{k: getattr(form, k) for k in ["id", "slug", "title", "description", "status", "theme_config", "thank_you_message", "created_at", "updated_at", "response_count"]},
            questions=[QuestionResponse.model_validate(q) for q in active_questions]
        )
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
        
        active_questions = sorted([q for q in form.questions if not q.is_deleted], key=lambda q: q.order_index)
        resp = FormDetailResponse(
            **{k: getattr(form, k) for k in ["id", "slug", "title", "description", "status", "theme_config", "thank_you_message", "created_at", "updated_at", "response_count"]},
            questions=[QuestionResponse.model_validate(q) for q in active_questions]
        )
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
        
        active_questions = sorted([q for q in new_form.questions if not q.is_deleted], key=lambda q: q.order_index)
        resp = FormDetailResponse(
            **{k: getattr(new_form, k) for k in ["id", "slug", "title", "description", "status", "theme_config", "thank_you_message", "created_at", "updated_at", "response_count"]},
            questions=[QuestionResponse.model_validate(q) for q in active_questions]
        )
        return resp

    def publish_form(self, form_id: str):
        creator_id = self._get_creator_id()
        form = self.repo.get_form_by_id_and_creator(form_id, creator_id)
        if not form:
            raise HTTPException(status_code=404, detail="Form not found")
            
        active_questions = sorted([q for q in form.questions if not q.is_deleted], key=lambda q: q.order_index)
        if not active_questions:
            raise HTTPException(status_code=400, detail="Cannot publish a form with no active questions")
            
        for q in active_questions:
            try:
                QuestionService.validate_properties(q.type, q.properties)
            except ValueError as e:
                raise HTTPException(status_code=400, detail=f"Invalid configuration for question '{q.title}': {str(e)}")
                
        if form.status != FormStatus.published:
            form.status = FormStatus.published
            form.updated_at = datetime.utcnow()
            self.db.commit()
            self.db.refresh(form)
            
        setattr(form, "response_count", self.repo.count_responses(form.id))
        
        resp = FormDetailResponse(
            **{k: getattr(form, k) for k in ["id", "slug", "title", "description", "status", "theme_config", "thank_you_message", "created_at", "updated_at", "response_count"]},
            questions=[QuestionResponse.model_validate(q) for q in active_questions]
        )
        return resp

    def unpublish_form(self, form_id: str):
        creator_id = self._get_creator_id()
        form = self.repo.get_form_by_id_and_creator(form_id, creator_id)
        if not form:
            raise HTTPException(status_code=404, detail="Form not found")
            
        if form.status != FormStatus.draft:
            form.status = FormStatus.draft
            form.updated_at = datetime.utcnow()
            self.db.commit()
            self.db.refresh(form)
            
        setattr(form, "response_count", self.repo.count_responses(form.id))
        active_questions = sorted([q for q in form.questions if not q.is_deleted], key=lambda q: q.order_index)
        
        resp = FormDetailResponse(
            **{k: getattr(form, k) for k in ["id", "slug", "title", "description", "status", "theme_config", "thank_you_message", "created_at", "updated_at", "response_count"]},
            questions=[QuestionResponse.model_validate(q) for q in active_questions]
        )
        return resp
