from pydantic import BaseModel
from typing import Any
import json

class AnswerSubmit(BaseModel):
    value: Any

obj = AnswerSubmit.model_validate_json('{"value": true}')
print(repr(obj.value), type(obj.value))
obj2 = AnswerSubmit.model_validate_json('{"value": 42}')
print(repr(obj2.value), type(obj2.value))
