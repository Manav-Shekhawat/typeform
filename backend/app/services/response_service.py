import re
from fastapi import HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from app.repositories.public_form_repository import PublicFormRepository
from app.repositories.response_repository import ResponseRepository
from app.schemas.response import ResponseSubmit
from app.models.form import FormStatus
from app.models.question import QuestionType

class ResponseService:
    def __init__(self, db: Session):
        self.db = db
        self.form_repo = PublicFormRepository(db)
        self.resp_repo = ResponseRepository(db)

    def _is_empty(self, value: any) -> bool:
        if value is None:
            return True
        if isinstance(value, str) and not value.strip():
            return True
        return False

    def submit_response(self, slug: str, submission: ResponseSubmit):
        form = self.form_repo.get_form_by_slug(slug)
        if not form or form.status != FormStatus.published:
            raise HTTPException(status_code=404, detail="Form not found")

        active_questions = [q for q in form.questions if not q.is_deleted]
        q_map = {q.id: q for q in active_questions}
        
        # Check for duplicates in submission
        submitted_keys = [ans.question_id for ans in submission.answers]
        if len(set(submitted_keys)) != len(submitted_keys):
            raise HTTPException(status_code=400, detail=[{"message": "Duplicate question_id in submission"}])
            
        submitted_answers = {ans.question_id: ans.value for ans in submission.answers}
        
        valid_answers = []
        errors = []

        # Validate question IDs
        for q_id in submitted_answers.keys():
            if q_id not in q_map:
                errors.append({"question_id": q_id, "message": "Invalid or unknown question ID"})

        # Validate answers against active questions
        for q in active_questions:
            val = submitted_answers.get(q.id)
            if self._is_empty(val):
                if q.is_required:
                    errors.append({"question_id": q.id, "message": "This field is required"})
                continue
            
            try:
                canonical_val = self._validate_and_format(q, val)
                valid_answers.append({"question_id": q.id, "value": canonical_val})
            except ValueError as e:
                errors.append({"question_id": q.id, "message": str(e)})

        if errors:
            raise HTTPException(status_code=400, detail=errors)

        try:
            resp = self.resp_repo.create_response(form.id, valid_answers)
            return resp
        except SQLAlchemyError:
            self.db.rollback()
            raise HTTPException(status_code=500, detail="Internal server error")

    def _validate_and_format(self, q, val: any) -> str:
        if q.type in (QuestionType.SHORT_TEXT, QuestionType.LONG_TEXT):
            if not isinstance(val, str):
                raise ValueError("Must be a string")
            return val.strip()
            
        elif q.type == QuestionType.EMAIL:
            if not isinstance(val, str):
                raise ValueError("Must be a string")
            val = val.strip()
            if not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", val):
                raise ValueError("Invalid email address")
            return val
            
        elif q.type == QuestionType.NUMBER:
            if type(val) is bool or not isinstance(val, (int, float)):
                raise ValueError("Must be a number")
            num = float(val)
            if q.properties:
                if "min" in q.properties and num < q.properties["min"]:
                    raise ValueError(f"Must be >= {q.properties['min']}")
                if "max" in q.properties and num > q.properties["max"]:
                    raise ValueError(f"Must be <= {q.properties['max']}")
            return str(num) if not num.is_integer() else str(int(num))
            
        elif q.type == QuestionType.YES_NO:
            if type(val) is not bool:
                raise ValueError("Must be a boolean value")
            return "true" if val else "false"
            
        elif q.type in (QuestionType.MULTIPLE_CHOICE, QuestionType.DROPDOWN):
            if not isinstance(val, str):
                raise ValueError("Must be a string")
            val = val.strip()
            choices = q.properties.get("choices", []) if q.properties else []
            if val not in choices:
                raise ValueError("Invalid choice")
            return val
            
        elif q.type == QuestionType.RATING:
            if type(val) is not int:
                raise ValueError("Must be an integer")
            num = val
            steps = q.properties.get("steps", 5) if q.properties else 5
            if num < 1 or num > steps:
                raise ValueError(f"Must be between 1 and {steps}")
            return str(num)
            
        raise ValueError("Unsupported question type")
