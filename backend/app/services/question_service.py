from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from app.repositories.form_repository import FormRepository, get_default_creator
from app.repositories.question_repository import QuestionRepository
from app.schemas.question import QuestionCreate, QuestionUpdate, QuestionReorderItem
from app.models.question import QuestionType
from typing import List, Dict, Any

class QuestionService:
    def __init__(self, db: Session):
        self.db = db
        self.form_repo = FormRepository(db)
        self.q_repo = QuestionRepository(db)

    def _verify_ownership(self, form_id: str):
        creator = get_default_creator(self.db)
        form = self.form_repo.get_form_by_id_and_creator(form_id, creator.id)
        if not form:
            raise HTTPException(status_code=404, detail="Form not found")
        return form

    @staticmethod
    def validate_properties(q_type: QuestionType, properties: Dict[str, Any] | None):
        if q_type == QuestionType.NUMBER:
            if properties:
                min_val = properties.get("min")
                max_val = properties.get("max")
                if min_val is not None and max_val is not None and min_val > max_val:
                    raise ValueError("min cannot be greater than max")
        elif q_type in (QuestionType.MULTIPLE_CHOICE, QuestionType.DROPDOWN):
            if not properties or "choices" not in properties:
                raise ValueError("choices must exist")
            choices = properties["choices"]
            if not isinstance(choices, list) or len(choices) == 0:
                raise ValueError("choices must be a non-empty array")
            if not all(isinstance(c, str) and str(c).strip() for c in choices):
                raise ValueError("choices must contain non-empty strings")
            if len(choices) != len(set(choices)):
                raise ValueError("choices should not contain duplicates")
        elif q_type == QuestionType.RATING:
            if not properties or "steps" not in properties:
                raise ValueError("steps must exist")
            steps = properties["steps"]
            if type(steps) is not int or steps < 3 or steps > 10:
                raise ValueError("steps must be an integer between 3 and 10")

    def create_question(self, form_id: str, q_in: QuestionCreate):
        self._verify_ownership(form_id)
        
        try:
            QuestionService.validate_properties(q_in.type, q_in.properties)
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))
            
        try:
            q = self.q_repo.create_question(form_id, q_in.model_dump())
            self.db.commit()
            self.db.refresh(q)
            return q
        except IntegrityError:
            self.db.rollback()
            raise HTTPException(status_code=409, detail="order_index already occupied")

    def update_question(self, form_id: str, question_id: str, q_in: QuestionUpdate):
        self._verify_ownership(form_id)
        q = self.q_repo.get_question_by_id_and_form(question_id, form_id)
        if not q or q.is_deleted:
            raise HTTPException(status_code=404, detail="Question not found")
            
        # Merge current data with update to validate
        new_type = q_in.type if q_in.type is not None else q.type
        new_props = q_in.properties if q_in.properties is not None else q.properties
        
        if q_in.type is not None or q_in.properties is not None:
            try:
                QuestionService.validate_properties(new_type, new_props)
            except ValueError as e:
                raise HTTPException(status_code=400, detail=str(e))
                
        update_data = q_in.model_dump(exclude_unset=True)
        try:
            q = self.q_repo.update_question(q, update_data)
            self.db.commit()
            self.db.refresh(q)
            return q
        except IntegrityError:
            self.db.rollback()
            raise HTTPException(status_code=409, detail="order_index already occupied")

    def delete_question(self, form_id: str, question_id: str):
        self._verify_ownership(form_id)
        q = self.q_repo.get_question_by_id_and_form(question_id, form_id)
        if not q or q.is_deleted:
            raise HTTPException(status_code=404, detail="Question not found")
            
        self.q_repo.soft_delete_question(q)
        self.db.commit()

    def reorder_questions(self, form_id: str, updates: List[QuestionReorderItem]):
        self._verify_ownership(form_id)
        
        if len({u.id for u in updates}) != len(updates):
            raise HTTPException(status_code=400, detail="Duplicate question IDs in request")
        if len({u.order_index for u in updates}) != len(updates):
            raise HTTPException(status_code=400, detail="Duplicate order_index in request")
            
        active_qs_list = self.q_repo.get_active_questions_in_form(form_id)
        active_qs_map = {q.id: q for q in active_qs_list}
        
        qs_to_update = []
        for u in updates:
            if u.id not in active_qs_map:
                raise HTTPException(status_code=400, detail=f"Question {u.id} not found or soft-deleted")
            qs_to_update.append((active_qs_map[u.id], u.order_index))
            
        try:
            # 1. Fetch ALL questions in the form (including soft-deleted)
            from app.models.question import Question
            all_qs = self.db.query(Question).filter(Question.form_id == form_id).all()
            
            # Save original indexes to restore unmentioned active questions
            original_indexes = {q.id: q.order_index for q in all_qs}
            
            # 2. Shift ALL questions to guaranteed unique negative space
            min_idx = min((q.order_index for q in all_qs), default=0)
            base = min_idx - 1000
            
            for i, q in enumerate(all_qs):
                q.order_index = base - i
            self.db.flush()
            
            # 3. Assign final order_index values
            updates_dict = {u.id: u.order_index for u in updates}
            
            for q in all_qs:
                if q.id in updates_dict:
                    # Apply requested update
                    q.order_index = updates_dict[q.id]
                elif not q.is_deleted:
                    # Restore unchanged active questions to trigger IntegrityError if they conflict
                    q.order_index = original_indexes[q.id]
                # Soft-deleted questions not in updates remain in safe negative space
                
            self.db.commit()
        except IntegrityError:
            self.db.rollback()
            raise HTTPException(status_code=409, detail="Reorder violates unique order_index constraints")
