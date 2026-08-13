import pytest
from app.models.form import Form
from app.models.question import QuestionType, Question
from app.models.response import Response
from app.models.answer import Answer
from app.models.creator import Creator

@pytest.fixture
def test_data(client, db_session):
    # 1. Create creator and form directly via DB for faster setup (since we already tested creator APIs)
    creator = Creator(name="Response Test Creator")
    db_session.add(creator)
    db_session.commit()
    
    form = Form(creator_id=creator.id, title="Test Form", slug="test-slug", status="published")
    db_session.add(form)
    db_session.commit()
    
    # 2. Add Questions
    qs = [
        Question(form_id=form.id, type=QuestionType.SHORT_TEXT, title="Q1", order_index=1, is_required=True),
        Question(form_id=form.id, type=QuestionType.LONG_TEXT, title="Q2", order_index=2, is_required=True),
        Question(form_id=form.id, type=QuestionType.EMAIL, title="Q3", order_index=3, is_required=True),
        Question(form_id=form.id, type=QuestionType.NUMBER, title="Q4", order_index=4, is_required=True, properties={"min": 10, "max": 100}),
        Question(form_id=form.id, type=QuestionType.YES_NO, title="Q5", order_index=5, is_required=True),
        Question(form_id=form.id, type=QuestionType.MULTIPLE_CHOICE, title="Q6", order_index=6, is_required=True, properties={"choices": ["A", "B"]}),
        Question(form_id=form.id, type=QuestionType.DROPDOWN, title="Q7", order_index=7, is_required=True, properties={"choices": ["X", "Y"]}),
        Question(form_id=form.id, type=QuestionType.RATING, title="Q8", order_index=8, is_required=True, properties={"steps": 5}),
        Question(form_id=form.id, type=QuestionType.SHORT_TEXT, title="Optional", order_index=9, is_required=False),
        Question(form_id=form.id, type=QuestionType.SHORT_TEXT, title="Deleted", order_index=10, is_required=True, is_deleted=True),
    ]
    db_session.add_all(qs)
    db_session.commit()
    
    return {
        "slug": "test-slug",
        "form_id": form.id,
        "questions": {q.title: str(q.id) for q in qs}
    }

def get_valid_payload(test_data):
    q = test_data["questions"]
    return {
        "answers": [
            {"question_id": q["Q1"], "value": "short"},
            {"question_id": q["Q2"], "value": "long"},
            {"question_id": q["Q3"], "value": "test@example.com"},
            {"question_id": q["Q4"], "value": 42},
            {"question_id": q["Q5"], "value": True},
            {"question_id": q["Q6"], "value": "A"},
            {"question_id": q["Q7"], "value": "X"},
            {"question_id": q["Q8"], "value": 3}
        ]
    }

# FORM ACCESS
def test_access_published_form(client, test_data):
    # 1. published form accepts submission
    payload = get_valid_payload(test_data)
    resp = client.post(f"/api/v1/public/forms/{test_data['slug']}/responses", json=payload)
    assert resp.status_code == 201

def test_access_unknown_slug(client, test_data):
    # 2. unknown slug -> 404
    resp = client.post("/api/v1/public/forms/unknown-slug/responses", json=get_valid_payload(test_data))
    assert resp.status_code == 404

def test_access_draft_form(client, db_session, test_data):
    # 3. draft form -> 404
    form = db_session.query(Form).filter_by(id=test_data["form_id"]).first()
    form.status = "draft"
    db_session.commit()
    
    resp = client.post(f"/api/v1/public/forms/{test_data['slug']}/responses", json=get_valid_payload(test_data))
    assert resp.status_code == 404

# QUESTION IDENTIFICATION
def test_invalid_question_id(client, test_data):
    # 4. invalid question ID rejected
    payload = get_valid_payload(test_data)
    payload["answers"][0]["question_id"] = "invalid-uuid"
    resp = client.post(f"/api/v1/public/forms/{test_data['slug']}/responses", json=payload)
    assert resp.status_code == 400

def test_question_from_another_form(client, db_session, test_data):
    # 5. question from another form rejected
    creator = Creator(name="Other")
    db_session.add(creator)
    db_session.commit()
    f2 = Form(creator_id=creator.id, title="F2", slug="s2", status="published")
    db_session.add(f2)
    db_session.commit()
    q2 = Question(form_id=f2.id, type=QuestionType.SHORT_TEXT, title="Other", order_index=1)
    db_session.add(q2)
    db_session.commit()
    
    payload = get_valid_payload(test_data)
    payload["answers"][0]["question_id"] = q2.id
    resp = client.post(f"/api/v1/public/forms/{test_data['slug']}/responses", json=payload)
    assert resp.status_code == 400

def test_soft_deleted_question(client, test_data):
    # 6. soft-deleted question rejected
    payload = get_valid_payload(test_data)
    payload["answers"].append({"question_id": test_data["questions"]["Deleted"], "value": "ans"})
    resp = client.post(f"/api/v1/public/forms/{test_data['slug']}/responses", json=payload)
    assert resp.status_code == 400

def test_duplicate_question_id(client, test_data):
    # 7. duplicate question ID rejected
    payload = get_valid_payload(test_data)
    payload["answers"].append({"question_id": test_data["questions"]["Q1"], "value": "duplicate"})
    resp = client.post(f"/api/v1/public/forms/{test_data['slug']}/responses", json=payload)
    assert resp.status_code == 400

# REQUIRED
def test_missing_required_short_text(client, test_data):
    payload = get_valid_payload(test_data)
    payload["answers"] = [a for a in payload["answers"] if a["question_id"] != test_data["questions"]["Q1"]]
    resp = client.post(f"/api/v1/public/forms/{test_data['slug']}/responses", json=payload)
    assert resp.status_code == 400

def test_missing_required_long_text(client, test_data):
    payload = get_valid_payload(test_data)
    payload["answers"] = [a for a in payload["answers"] if a["question_id"] != test_data["questions"]["Q2"]]
    assert client.post(f"/api/v1/public/forms/{test_data['slug']}/responses", json=payload).status_code == 400

def test_missing_required_email(client, test_data):
    payload = get_valid_payload(test_data)
    payload["answers"] = [a for a in payload["answers"] if a["question_id"] != test_data["questions"]["Q3"]]
    assert client.post(f"/api/v1/public/forms/{test_data['slug']}/responses", json=payload).status_code == 400

def test_missing_required_number(client, test_data):
    payload = get_valid_payload(test_data)
    payload["answers"] = [a for a in payload["answers"] if a["question_id"] != test_data["questions"]["Q4"]]
    assert client.post(f"/api/v1/public/forms/{test_data['slug']}/responses", json=payload).status_code == 400

def test_missing_required_yes_no(client, test_data):
    payload = get_valid_payload(test_data)
    payload["answers"] = [a for a in payload["answers"] if a["question_id"] != test_data["questions"]["Q5"]]
    assert client.post(f"/api/v1/public/forms/{test_data['slug']}/responses", json=payload).status_code == 400

def test_missing_required_multiple_choice(client, test_data):
    payload = get_valid_payload(test_data)
    payload["answers"] = [a for a in payload["answers"] if a["question_id"] != test_data["questions"]["Q6"]]
    assert client.post(f"/api/v1/public/forms/{test_data['slug']}/responses", json=payload).status_code == 400

def test_missing_required_dropdown(client, test_data):
    payload = get_valid_payload(test_data)
    payload["answers"] = [a for a in payload["answers"] if a["question_id"] != test_data["questions"]["Q7"]]
    assert client.post(f"/api/v1/public/forms/{test_data['slug']}/responses", json=payload).status_code == 400

def test_missing_required_rating(client, test_data):
    payload = get_valid_payload(test_data)
    payload["answers"] = [a for a in payload["answers"] if a["question_id"] != test_data["questions"]["Q8"]]
    assert client.post(f"/api/v1/public/forms/{test_data['slug']}/responses", json=payload).status_code == 400

def test_optional_unanswered_question_allowed(client, test_data):
    payload = get_valid_payload(test_data)
    # The payload does not contain the Optional question ID, which is fine
    assert client.post(f"/api/v1/public/forms/{test_data['slug']}/responses", json=payload).status_code == 201

# TYPE VALIDATION
def test_invalid_email(client, test_data):
    payload = get_valid_payload(test_data)
    next(a for a in payload["answers"] if a["question_id"] == test_data["questions"]["Q3"])["value"] = "not-an-email"
    assert client.post(f"/api/v1/public/forms/{test_data['slug']}/responses", json=payload).status_code == 400

def test_invalid_number(client, test_data):
    payload = get_valid_payload(test_data)
    next(a for a in payload["answers"] if a["question_id"] == test_data["questions"]["Q4"])["value"] = "abc"
    assert client.post(f"/api/v1/public/forms/{test_data['slug']}/responses", json=payload).status_code == 400

def test_number_below_min(client, test_data):
    payload = get_valid_payload(test_data)
    next(a for a in payload["answers"] if a["question_id"] == test_data["questions"]["Q4"])["value"] = 5
    assert client.post(f"/api/v1/public/forms/{test_data['slug']}/responses", json=payload).status_code == 400

def test_number_above_max(client, test_data):
    payload = get_valid_payload(test_data)
    next(a for a in payload["answers"] if a["question_id"] == test_data["questions"]["Q4"])["value"] = 105
    assert client.post(f"/api/v1/public/forms/{test_data['slug']}/responses", json=payload).status_code == 400

def test_invalid_yes_no(client, test_data):
    payload = get_valid_payload(test_data)
    next(a for a in payload["answers"] if a["question_id"] == test_data["questions"]["Q5"])["value"] = "maybe"
    assert client.post(f"/api/v1/public/forms/{test_data['slug']}/responses", json=payload).status_code == 400

def test_invalid_multiple_choice(client, test_data):
    payload = get_valid_payload(test_data)
    next(a for a in payload["answers"] if a["question_id"] == test_data["questions"]["Q6"])["value"] = "C"
    assert client.post(f"/api/v1/public/forms/{test_data['slug']}/responses", json=payload).status_code == 400

def test_invalid_dropdown(client, test_data):
    payload = get_valid_payload(test_data)
    next(a for a in payload["answers"] if a["question_id"] == test_data["questions"]["Q7"])["value"] = "Z"
    assert client.post(f"/api/v1/public/forms/{test_data['slug']}/responses", json=payload).status_code == 400

def test_invalid_rating_type(client, test_data):
    payload = get_valid_payload(test_data)
    next(a for a in payload["answers"] if a["question_id"] == test_data["questions"]["Q8"])["value"] = "abc"
    assert client.post(f"/api/v1/public/forms/{test_data['slug']}/responses", json=payload).status_code == 400

def test_rating_below_1(client, test_data):
    payload = get_valid_payload(test_data)
    next(a for a in payload["answers"] if a["question_id"] == test_data["questions"]["Q8"])["value"] = 0
    assert client.post(f"/api/v1/public/forms/{test_data['slug']}/responses", json=payload).status_code == 400

def test_rating_above_steps(client, test_data):
    payload = get_valid_payload(test_data)
    next(a for a in payload["answers"] if a["question_id"] == test_data["questions"]["Q8"])["value"] = 6
    assert client.post(f"/api/v1/public/forms/{test_data['slug']}/responses", json=payload).status_code == 400

def test_invalid_yes_no_strings(client, test_data):
    payload = get_valid_payload(test_data)
    next(a for a in payload["answers"] if a["question_id"] == test_data["questions"]["Q5"])["value"] = "true"
    assert client.post(f"/api/v1/public/forms/{test_data['slug']}/responses", json=payload).status_code == 400

    next(a for a in payload["answers"] if a["question_id"] == test_data["questions"]["Q5"])["value"] = "yes"
    assert client.post(f"/api/v1/public/forms/{test_data['slug']}/responses", json=payload).status_code == 400

    next(a for a in payload["answers"] if a["question_id"] == test_data["questions"]["Q5"])["value"] = 1
    assert client.post(f"/api/v1/public/forms/{test_data['slug']}/responses", json=payload).status_code == 400

def test_invalid_number_types(client, test_data):
    payload = get_valid_payload(test_data)
    next(a for a in payload["answers"] if a["question_id"] == test_data["questions"]["Q4"])["value"] = True
    assert client.post(f"/api/v1/public/forms/{test_data['slug']}/responses", json=payload).status_code == 400

    next(a for a in payload["answers"] if a["question_id"] == test_data["questions"]["Q4"])["value"] = "42"
    assert client.post(f"/api/v1/public/forms/{test_data['slug']}/responses", json=payload).status_code == 400

def test_invalid_rating_types(client, test_data):
    payload = get_valid_payload(test_data)
    next(a for a in payload["answers"] if a["question_id"] == test_data["questions"]["Q8"])["value"] = 3.5
    assert client.post(f"/api/v1/public/forms/{test_data['slug']}/responses", json=payload).status_code == 400

    next(a for a in payload["answers"] if a["question_id"] == test_data["questions"]["Q8"])["value"] = "3"
    assert client.post(f"/api/v1/public/forms/{test_data['slug']}/responses", json=payload).status_code == 400

    next(a for a in payload["answers"] if a["question_id"] == test_data["questions"]["Q8"])["value"] = True
    assert client.post(f"/api/v1/public/forms/{test_data['slug']}/responses", json=payload).status_code == 400

# VALID SUBMISSION
def test_valid_submission_creates_response_and_answers(client, db_session, test_data):
    payload = get_valid_payload(test_data)
    
    # Also answer the optional question to test multiple question types
    payload["answers"].append({"question_id": test_data["questions"]["Optional"], "value": "optional ans"})
    
    # 29. multiple types submitted together
    resp = client.post(f"/api/v1/public/forms/{test_data['slug']}/responses", json=payload)
    assert resp.status_code == 201
    
    # 27. valid submission creates one Response
    resp_id = resp.json()["id"]
    db_response = db_session.query(Response).filter_by(id=resp_id).first()
    assert db_response is not None
    assert db_response.form_id == test_data["form_id"]
    
    # 28. valid submission creates correct Answers
    db_answers = db_session.query(Answer).filter_by(response_id=resp_id).all()
    assert len(db_answers) == 9 # 8 required + 1 optional
    
    ans_map = {a.question_id: a.value for a in db_answers}
    assert ans_map[test_data["questions"]["Q1"]] == "short"
    assert ans_map[test_data["questions"]["Q3"]] == "test@example.com"
    assert ans_map[test_data["questions"]["Q4"]] == "42"
    assert ans_map[test_data["questions"]["Q5"]] == "true"
    assert ans_map[test_data["questions"]["Q6"]] == "A"
    assert ans_map[test_data["questions"]["Q7"]] == "X"
    assert ans_map[test_data["questions"]["Q8"]] == "3"
    assert ans_map[test_data["questions"]["Optional"]] == "optional ans"

def test_optional_unanswered_do_not_create_rows(client, db_session, test_data):
    payload = get_valid_payload(test_data)
    resp = client.post(f"/api/v1/public/forms/{test_data['slug']}/responses", json=payload)
    assert resp.status_code == 201
    
    resp_id = resp.json()["id"]
    db_answers = db_session.query(Answer).filter_by(response_id=resp_id).all()
    # 30. optional unanswered questions do not create Answer rows
    assert len(db_answers) == 8

# ATOMICITY
def test_invalid_submission_creates_no_response(client, db_session, test_data):
    initial_responses_count = db_session.query(Response).count()
    initial_answers_count = db_session.query(Answer).count()
    
    payload = get_valid_payload(test_data)
    # create error
    next(a for a in payload["answers"] if a["question_id"] == test_data["questions"]["Q8"])["value"] = 100
    
    resp = client.post(f"/api/v1/public/forms/{test_data['slug']}/responses", json=payload)
    assert resp.status_code == 400
    
    # 31. invalid submission creates no Response
    # 32. invalid submission creates no partial Answers
    assert db_session.query(Response).count() == initial_responses_count
    assert db_session.query(Answer).count() == initial_answers_count
