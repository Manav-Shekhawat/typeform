from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.schemas.public import PublicFormResponse
from app.services.public_form_service import PublicFormService

router = APIRouter(prefix="/api/v1/public/forms", tags=["Public Forms"])

def get_public_form_service(db: Session = Depends(get_db)) -> PublicFormService:
    return PublicFormService(db)

@router.get("/{slug}", response_model=PublicFormResponse)
def get_public_form(slug: str, service: PublicFormService = Depends(get_public_form_service)):
    return service.get_public_form(slug)
