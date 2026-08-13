from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.schemas.results import ResponseSummary, StatsResponse
from app.services.results_service import ResultsService

router = APIRouter(prefix="/api/v1/forms", tags=["Results"])

def get_results_service(db: Session = Depends(get_db)) -> ResultsService:
    return ResultsService(db)

@router.get("/{form_id}/responses", response_model=List[ResponseSummary])
def list_responses(form_id: str, service: ResultsService = Depends(get_results_service)):
    return service.list_responses(form_id)

@router.get("/{form_id}/responses/{response_id}", response_model=ResponseSummary)
def get_response(form_id: str, response_id: str, service: ResultsService = Depends(get_results_service)):
    return service.get_response(form_id, response_id)

@router.get("/{form_id}/stats", response_model=StatsResponse)
def get_stats(form_id: str, service: ResultsService = Depends(get_results_service)):
    return service.get_stats(form_id)
