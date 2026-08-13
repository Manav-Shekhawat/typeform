from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, Dict, Any, List
from app.models.question import QuestionType

class QuestionBase(BaseModel):
    type: QuestionType
    title: str = Field(..., min_length=1)
    description: Optional[str] = None
    is_required: bool = False
    order_index: int = Field(..., ge=0)
    properties: Optional[Dict[str, Any]] = None

class QuestionCreate(QuestionBase):
    pass

class QuestionUpdate(BaseModel):
    type: Optional[QuestionType] = None
    title: Optional[str] = Field(None, min_length=1)
    description: Optional[str] = None
    is_required: Optional[bool] = None
    order_index: Optional[int] = Field(None, ge=0)
    properties: Optional[Dict[str, Any]] = None

class QuestionReorderItem(BaseModel):
    id: str
    order_index: int = Field(..., ge=0)

class QuestionResponse(QuestionBase):
    id: str
    form_id: str
    
    model_config = ConfigDict(from_attributes=True)
