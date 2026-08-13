from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.schemas.public import PublicFormResponse
from app.services.public_form_service import PublicFormService
from app.schemas.response import ResponseSubmit, ResponseResult
from app.services.response_service import ResponseService

router = APIRouter(prefix="/api/v1/public/forms", tags=["Public Forms"])

def get_public_form_service(db: Session = Depends(get_db)) -> PublicFormService:
    return PublicFormService(db)

def get_response_service(db: Session = Depends(get_db)) -> ResponseService:
    return ResponseService(db)

@router.get("/{slug}", response_model=PublicFormResponse)
def get_public_form(slug: str, service: PublicFormService = Depends(get_public_form_service)):
    return service.get_public_form(slug)

@router.post("/{slug}/responses", response_model=ResponseResult, status_code=status.HTTP_201_CREATED)
def submit_response(slug: str, submission: ResponseSubmit, service: ResponseService = Depends(get_response_service)):
    resp = service.submit_response(slug, submission)
    return ResponseResult(id=resp.id)
