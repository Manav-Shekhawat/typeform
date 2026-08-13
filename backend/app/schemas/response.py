from pydantic import BaseModel
from typing import List, Any

class AnswerSubmit(BaseModel):
    question_id: str
    value: Any

class ResponseSubmit(BaseModel):
    answers: List[AnswerSubmit]

class ResponseResult(BaseModel):
    id: str
    message: str = "Response submitted successfully"
