import pytest
from app.models.creator import Creator
from app.models.form import Form
from app.models.question import Question, QuestionType
from app.models.response import Response
from app.models.answer import Answer

@pytest.fixture
def form_id(client):
    resp = client.post("/api/v1/forms", json={"title": "Test Form"})
    return resp.json()["id"]

@pytest.fixture
def other_form_id(client, db_session):
    other_creator = Creator(name="Other")
    db_session.add(other_creator)
    db_session.commit()
    form = Form(creator_id=other_creator.id, title="Other Form", slug="other-slug")
    db_session.add(form)
    db_session.commit()
    return form.id

# 1-8. Create each type
def test_create_short_text(client, form_id):
    resp = client.post(f"/api/v1/forms/{form_id}/questions", json={
        "type": "SHORT_TEXT", "title": "Q1", "order_index": 0
    })
    assert resp.status_code == 201
    assert resp.json()["type"] == "SHORT_TEXT"

def test_create_long_text(client, form_id):
    resp = client.post(f"/api/v1/forms/{form_id}/questions", json={
        "type": "LONG_TEXT", "title": "Q", "order_index": 0
    })
    assert resp.status_code == 201

def test_create_email(client, form_id):
    resp = client.post(f"/api/v1/forms/{form_id}/questions", json={
        "type": "EMAIL", "title": "Q", "order_index": 0
    })
    assert resp.status_code == 201

def test_create_number(client, form_id):
    resp = client.post(f"/api/v1/forms/{form_id}/questions", json={
        "type": "NUMBER", "title": "Q", "order_index": 0, "properties": {"min": 1, "max": 10}
    })
    assert resp.status_code == 201

def test_create_yes_no(client, form_id):
    resp = client.post(f"/api/v1/forms/{form_id}/questions", json={
        "type": "YES_NO", "title": "Q", "order_index": 0
    })
    assert resp.status_code == 201

def test_create_multiple_choice(client, form_id):
    resp = client.post(f"/api/v1/forms/{form_id}/questions", json={
        "type": "MULTIPLE_CHOICE", "title": "Q", "order_index": 0, "properties": {"choices": ["A", "B"]}
    })
    assert resp.status_code == 201

def test_create_dropdown(client, form_id):
    resp = client.post(f"/api/v1/forms/{form_id}/questions", json={
        "type": "DROPDOWN", "title": "Q", "order_index": 0, "properties": {"choices": ["A", "B"]}
    })
    assert resp.status_code == 201

def test_create_rating(client, form_id):
    resp = client.post(f"/api/v1/forms/{form_id}/questions", json={
        "type": "RATING", "title": "Q", "order_index": 0, "properties": {"steps": 5}
    })
    assert resp.status_code == 201

# 9-15. Validation
def test_validation_empty_title(client, form_id):
    resp = client.post(f"/api/v1/forms/{form_id}/questions", json={
        "type": "SHORT_TEXT", "title": "", "order_index": 0
    })
    assert resp.status_code == 422

def test_validation_negative_order(client, form_id):
    resp = client.post(f"/api/v1/forms/{form_id}/questions", json={
        "type": "SHORT_TEXT", "title": "Q", "order_index": -1
    })
    assert resp.status_code == 422

def test_validation_empty_choice_list(client, form_id):
    resp = client.post(f"/api/v1/forms/{form_id}/questions", json={
        "type": "MULTIPLE_CHOICE", "title": "Q", "order_index": 0, "properties": {"choices": []}
    })
    assert resp.status_code == 400

def test_validation_duplicate_choices(client, form_id):
    resp = client.post(f"/api/v1/forms/{form_id}/questions", json={
        "type": "MULTIPLE_CHOICE", "title": "Q", "order_index": 0, "properties": {"choices": ["A", "A"]}
    })
    assert resp.status_code == 400

def test_validation_invalid_number_min_max(client, form_id):
    resp = client.post(f"/api/v1/forms/{form_id}/questions", json={
        "type": "NUMBER", "title": "Q", "order_index": 0, "properties": {"min": 10, "max": 5}
    })
    assert resp.status_code == 400

def test_validation_invalid_rating_steps(client, form_id):
    resp = client.post(f"/api/v1/forms/{form_id}/questions", json={
        "type": "RATING", "title": "Q", "order_index": 0, "properties": {"steps": 11}
    })
    assert resp.status_code == 400

def test_validation_invalid_type(client, form_id):
    resp = client.post(f"/api/v1/forms/{form_id}/questions", json={
        "type": "INVALID_TYPE", "title": "Q", "order_index": 0
    })
    assert resp.status_code == 422

# 16-19. Ownership
def test_ownership_cannot_create_in_other(client, other_form_id):
    resp = client.post(f"/api/v1/forms/{other_form_id}/questions", json={
        "type": "SHORT_TEXT", "title": "Q", "order_index": 0
    })
    assert resp.status_code == 404

def test_ownership_cannot_update_other(client, db_session, other_form_id):
    q = Question(form_id=other_form_id, type=QuestionType.SHORT_TEXT, title="Q", order_index=0)
    db_session.add(q)
    db_session.commit()
    resp = client.put(f"/api/v1/forms/{other_form_id}/questions/{q.id}", json={"title": "New"})
    assert resp.status_code == 404

def test_ownership_cannot_delete_other(client, db_session, other_form_id):
    q = Question(form_id=other_form_id, type=QuestionType.SHORT_TEXT, title="Q", order_index=0)
    db_session.add(q)
    db_session.commit()
    resp = client.delete(f"/api/v1/forms/{other_form_id}/questions/{q.id}")
    assert resp.status_code == 404

def test_ownership_cannot_reorder_other(client, db_session, other_form_id):
    q = Question(form_id=other_form_id, type=QuestionType.SHORT_TEXT, title="Q", order_index=0)
    db_session.add(q)
    db_session.commit()
    resp = client.put(f"/api/v1/forms/{other_form_id}/questions/reorder", json=[{"id": q.id, "order_index": 1}])
    assert resp.status_code == 404

# 20-23. Question lifecycle
def test_lifecycle_update_question(client, form_id):
    resp = client.post(f"/api/v1/forms/{form_id}/questions", json={"type": "SHORT_TEXT", "title": "Q", "order_index": 0})
    q_id = resp.json()["id"]
    
    resp2 = client.put(f"/api/v1/forms/{form_id}/questions/{q_id}", json={"title": "New Title", "is_required": True})
    assert resp2.status_code == 200
    assert resp2.json()["title"] == "New Title"
    assert resp2.json()["is_required"] is True

def test_lifecycle_soft_delete(client, form_id, db_session):
    resp = client.post(f"/api/v1/forms/{form_id}/questions", json={"type": "SHORT_TEXT", "title": "Q", "order_index": 0})
    q_id = resp.json()["id"]
    
    # Add historical answer
    response = Response(form_id=form_id)
    db_session.add(response)
    db_session.commit()
    ans = Answer(response_id=response.id, question_id=q_id, value="Ans")
    db_session.add(ans)
    db_session.commit()

    resp_del = client.delete(f"/api/v1/forms/{form_id}/questions/{q_id}")
    assert resp_del.status_code == 204
    
    # Active results hide it
    resp_get = client.get(f"/api/v1/forms/{form_id}")
    assert len(resp_get.json()["questions"]) == 0
    
    # Historical answer remains
    db_ans = db_session.query(Answer).filter_by(id=ans.id).first()
    assert db_ans is not None
    assert db_ans.value == "Ans"

# 24-29. Reordering
def test_reorder_successful(client, form_id):
    q1 = client.post(f"/api/v1/forms/{form_id}/questions", json={"type": "SHORT_TEXT", "title": "Q1", "order_index": 0}).json()["id"]
    q2 = client.post(f"/api/v1/forms/{form_id}/questions", json={"type": "SHORT_TEXT", "title": "Q2", "order_index": 1}).json()["id"]
    
    resp = client.put(f"/api/v1/forms/{form_id}/questions/reorder", json=[
        {"id": q1, "order_index": 1},
        {"id": q2, "order_index": 0}
    ])
    assert resp.status_code == 204
    
    resp_get = client.get(f"/api/v1/forms/{form_id}")
    qs = resp_get.json()["questions"]
    assert qs[0]["id"] == q2
    assert qs[0]["order_index"] == 0
    assert qs[1]["id"] == q1
    assert qs[1]["order_index"] == 1

def test_reorder_duplicate_ids(client, form_id):
    q1 = client.post(f"/api/v1/forms/{form_id}/questions", json={"type": "SHORT_TEXT", "title": "Q1", "order_index": 0}).json()["id"]
    resp = client.put(f"/api/v1/forms/{form_id}/questions/reorder", json=[
        {"id": q1, "order_index": 1},
        {"id": q1, "order_index": 2}
    ])
    assert resp.status_code == 400

def test_reorder_duplicate_order(client, form_id):
    q1 = client.post(f"/api/v1/forms/{form_id}/questions", json={"type": "SHORT_TEXT", "title": "Q1", "order_index": 0}).json()["id"]
    q2 = client.post(f"/api/v1/forms/{form_id}/questions", json={"type": "SHORT_TEXT", "title": "Q2", "order_index": 1}).json()["id"]
    resp = client.put(f"/api/v1/forms/{form_id}/questions/reorder", json=[
        {"id": q1, "order_index": 2},
        {"id": q2, "order_index": 2}
    ])
    assert resp.status_code == 400

def test_reorder_other_form_rejected(client, form_id, other_form_id, db_session):
    q1 = client.post(f"/api/v1/forms/{form_id}/questions", json={"type": "SHORT_TEXT", "title": "Q1", "order_index": 0}).json()["id"]
    
    # Q from other form
    q_other = Question(form_id=other_form_id, type=QuestionType.SHORT_TEXT, title="Q2", order_index=0)
    db_session.add(q_other)
    db_session.commit()

    resp = client.put(f"/api/v1/forms/{form_id}/questions/reorder", json=[
        {"id": q1, "order_index": 1},
        {"id": q_other.id, "order_index": 0}
    ])
    assert resp.status_code == 400 # Question not found or soft-deleted

def test_reorder_soft_deleted_rejected(client, form_id):
    q1 = client.post(f"/api/v1/forms/{form_id}/questions", json={"type": "SHORT_TEXT", "title": "Q1", "order_index": 0}).json()["id"]
    client.delete(f"/api/v1/forms/{form_id}/questions/{q1}")
    
    resp = client.put(f"/api/v1/forms/{form_id}/questions/reorder", json=[
        {"id": q1, "order_index": 0}
    ])
    assert resp.status_code == 400

def test_reorder_failed_reorder_no_partial(client, form_id):
    q1 = client.post(f"/api/v1/forms/{form_id}/questions", json={"type": "SHORT_TEXT", "title": "Q1", "order_index": 0}).json()["id"]
    q2 = client.post(f"/api/v1/forms/{form_id}/questions", json={"type": "SHORT_TEXT", "title": "Q2", "order_index": 1}).json()["id"]
    
    # Attempt to reorder with a conflict that triggers IntegrityError
    # We'll just provide an order_index that conflicts with an existing un-reordered question 
    # (actually if we provide duplicate order_index it fails early, but let's say we don't include Q3 in the update, but try to overwrite Q3's order)
    q3 = client.post(f"/api/v1/forms/{form_id}/questions", json={"type": "SHORT_TEXT", "title": "Q3", "order_index": 2}).json()["id"]
    
    resp = client.put(f"/api/v1/forms/{form_id}/questions/reorder", json=[
        {"id": q1, "order_index": 2}, # Conflicts with Q3
        {"id": q2, "order_index": 3}
    ])
    
    assert resp.status_code == 409
    
    # Verify no partial modification happened
    resp_get = client.get(f"/api/v1/forms/{form_id}")
    qs = resp_get.json()["questions"]
    
    assert qs[0]["id"] == q1 and qs[0]["order_index"] == 0
    assert qs[1]["id"] == q2 and qs[1]["order_index"] == 1
    assert qs[2]["id"] == q3 and qs[2]["order_index"] == 2
