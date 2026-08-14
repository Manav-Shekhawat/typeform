import asyncio
from app.models.question import Question, QuestionType
from app.services.response_service import ResponseService

class MockDB:
    def rollback(self): pass

rs = ResponseService(MockDB())

def test(q_type, props, val):
    q = Question(id="1", type=q_type, properties=props)
    try:
        res = rs._validate_and_format(q, val)
        print(f"{q_type.name} with {repr(val)} -> {repr(res)}")
    except Exception as e:
        print(f"{q_type.name} with {repr(val)} -> ERROR: {e}")

test(QuestionType.SHORT_TEXT, {}, "hello")
test(QuestionType.EMAIL, {}, "test@example.com")
test(QuestionType.NUMBER, {}, "42")
test(QuestionType.NUMBER, {}, 42)
test(QuestionType.YES_NO, {}, True)
test(QuestionType.YES_NO, {}, "true")
test(QuestionType.MULTIPLE_CHOICE, {"choices": ["A", "B"]}, "A")
test(QuestionType.RATING, {"steps": 5}, 4)
test(QuestionType.RATING, {"steps": 5}, "4")
test(QuestionType.DROPDOWN, {"choices": ["A", "B"]}, "A")
