from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, List
from datetime import datetime
from app.models.form import FormStatus
from .question import QuestionResponse

class FormBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None

class FormCreate(FormBase):
    pass

class FormUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None

class FormResponse(FormBase):
    id: str
    slug: str
    status: FormStatus
    theme_config: Optional[dict] = None
    thank_you_message: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    response_count: int = 0
    
    model_config = ConfigDict(from_attributes=True)

class FormDetailResponse(FormResponse):
    questions: List[QuestionResponse] = []
