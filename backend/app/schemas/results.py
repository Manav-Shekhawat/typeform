from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime
from app.models.question import QuestionType

class AnswerResult(BaseModel):
    question_id: str
    question_title: str
    question_type: QuestionType
    value: Any

class ResponseSummary(BaseModel):
    id: str
    submitted_at: datetime
    answers: List[AnswerResult]
    
    model_config = ConfigDict(from_attributes=True)

class QuestionStats(BaseModel):
    question_id: str
    question_title: str
    question_type: QuestionType
    response_count: int
    
    # NUMBER
    average: Optional[float] = None
    minimum: Optional[float] = None
    maximum: Optional[float] = None
    
    # YES_NO
    true_count: Optional[int] = None
    false_count: Optional[int] = None
    
    # MULTIPLE_CHOICE / DROPDOWN
    choice_counts: Optional[Dict[str, int]] = None
    
    # RATING
    distribution: Optional[Dict[str, int]] = None

class StatsResponse(BaseModel):
    questions: List[QuestionStats]
