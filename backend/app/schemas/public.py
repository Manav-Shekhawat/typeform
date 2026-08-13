from pydantic import BaseModel, ConfigDict
from typing import Optional, Dict, Any, List
from app.models.question import QuestionType

class PublicQuestionResponse(BaseModel):
    id: str
    type: QuestionType
    title: str
    description: Optional[str] = None
    is_required: bool
    order_index: int
    properties: Optional[Dict[str, Any]] = None

    model_config = ConfigDict(from_attributes=True)

class PublicFormResponse(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    theme_config: Optional[dict] = None
    thank_you_message: Optional[str] = None
    questions: List[PublicQuestionResponse]

    model_config = ConfigDict(from_attributes=True)
