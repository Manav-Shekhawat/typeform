import pytest
from app.models.question import Question

@pytest.fixture
def form_id(client):
    resp = client.post("/api/v1/forms", json={"title": "Test Form"})
    return resp.json()["id"]

def test_regression_get_form_with_deleted_questions(client, form_id, db_session):
    # Create questions
    q1 = client.post(f"/api/v1/forms/{form_id}/questions", json={"type": "SHORT_TEXT", "title": "Q1", "order_index": 0}).json()["id"]
    q2 = client.post(f"/api/v1/forms/{form_id}/questions", json={"type": "SHORT_TEXT", "title": "Q2", "order_index": 1}).json()["id"]
    
    # Delete q1
    resp = client.delete(f"/api/v1/forms/{form_id}/questions/{q1}")
    assert resp.status_code == 204
    
    # Intentionally corrupt q1's order_index to simulate past bug
    q1_db = db_session.query(Question).filter(Question.id == q1).first()
    q1_db.order_index = -5000
    db_session.commit()
    
    # We will just verify GET succeeds when a deleted question exists
    resp = client.get(f"/api/v1/forms/{form_id}")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data["questions"]) == 1
    assert data["questions"][0]["id"] == q2

def test_regression_reorder_no_negative(client, form_id, db_session):
    q1 = client.post(f"/api/v1/forms/{form_id}/questions", json={"type": "SHORT_TEXT", "title": "Q1", "order_index": 0}).json()["id"]
    q2 = client.post(f"/api/v1/forms/{form_id}/questions", json={"type": "SHORT_TEXT", "title": "Q2", "order_index": 1}).json()["id"]
    
    # Delete Q1
    client.delete(f"/api/v1/forms/{form_id}/questions/{q1}")
    
    # Reorder remaining (Q2 -> index 0)
    resp = client.put(f"/api/v1/forms/{form_id}/questions/reorder", json=[
        {"id": q2, "order_index": 0}
    ])
    assert resp.status_code == 204
    
    # Verify in DB that Q1 (deleted) has a valid non-negative order_index
    q1_db = db_session.query(Question).filter(Question.id == q1).first()
    assert q1_db.order_index >= 0
    
    # Verify Q2 has 0
    q2_db = db_session.query(Question).filter(Question.id == q2).first()
    assert q2_db.order_index == 0
