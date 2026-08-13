from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.schemas.form import FormCreate, FormUpdate, FormResponse, FormDetailResponse
from app.services.form_service import FormService

router = APIRouter(prefix="/api/v1/forms", tags=["Forms"])

def get_form_service(db: Session = Depends(get_db)) -> FormService:
    return FormService(db)

@router.get("", response_model=List[FormResponse])
def list_forms(service: FormService = Depends(get_form_service)):
    return service.list_forms()

@router.post("", response_model=FormResponse, status_code=status.HTTP_201_CREATED)
def create_form(form_in: FormCreate, service: FormService = Depends(get_form_service)):
    return service.create_form(form_in)

@router.get("/{form_id}", response_model=FormDetailResponse)
def get_form(form_id: str, service: FormService = Depends(get_form_service)):
    return service.get_form(form_id)

@router.patch("/{form_id}", response_model=FormDetailResponse)
def update_form(form_id: str, form_in: FormUpdate, service: FormService = Depends(get_form_service)):
    return service.update_form(form_id, form_in)

@router.delete("/{form_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_form(form_id: str, service: FormService = Depends(get_form_service)):
    service.delete_form(form_id)
    return None

@router.post("/{form_id}/duplicate", response_model=FormDetailResponse, status_code=status.HTTP_201_CREATED)
def duplicate_form(form_id: str, service: FormService = Depends(get_form_service)):
    return service.duplicate_form(form_id)

@router.post("/{form_id}/publish", response_model=FormDetailResponse, status_code=status.HTTP_200_OK)
def publish_form(form_id: str, service: FormService = Depends(get_form_service)):
    return service.publish_form(form_id)

@router.post("/{form_id}/unpublish", response_model=FormDetailResponse, status_code=status.HTTP_200_OK)
def unpublish_form(form_id: str, service: FormService = Depends(get_form_service)):
    return service.unpublish_form(form_id)
