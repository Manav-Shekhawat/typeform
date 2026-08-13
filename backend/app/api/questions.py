from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.schemas.question import QuestionCreate, QuestionUpdate, QuestionResponse, QuestionReorderItem
from app.services.question_service import QuestionService

router = APIRouter(prefix="/api/v1/forms/{form_id}/questions", tags=["Questions"])

def get_question_service(db: Session = Depends(get_db)) -> QuestionService:
    return QuestionService(db)

@router.post("", response_model=QuestionResponse, status_code=status.HTTP_201_CREATED)
def create_question(form_id: str, q_in: QuestionCreate, service: QuestionService = Depends(get_question_service)):
    return service.create_question(form_id, q_in)

@router.put("/reorder", status_code=status.HTTP_204_NO_CONTENT)
def reorder_questions(form_id: str, updates: List[QuestionReorderItem], service: QuestionService = Depends(get_question_service)):
    service.reorder_questions(form_id, updates)
    return None

@router.put("/{question_id}", response_model=QuestionResponse)
def update_question(form_id: str, question_id: str, q_in: QuestionUpdate, service: QuestionService = Depends(get_question_service)):
    return service.update_question(form_id, question_id, q_in)

@router.delete("/{question_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_question(form_id: str, question_id: str, service: QuestionService = Depends(get_question_service)):
    service.delete_question(form_id, question_id)
    return None
