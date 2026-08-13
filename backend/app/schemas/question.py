from pydantic import BaseModel, ConfigDict
from typing import Optional, Dict, Any
from app.models.question import QuestionType

class QuestionBase(BaseModel):
    type: QuestionType
    title: str
    description: Optional[str] = None
    is_required: bool = False
    order_index: int
    properties: Optional[Dict[str, Any]] = None

class QuestionResponse(QuestionBase):
    id: str
    form_id: str
    
    model_config = ConfigDict(from_attributes=True)
