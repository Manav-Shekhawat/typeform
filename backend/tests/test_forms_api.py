import pytest
from app.models.creator import Creator
from app.models.form import Form, FormStatus
from app.models.question import Question, QuestionType
from app.models.response import Response
from app.models.answer import Answer
from app.db.database import get_db

def test_list_forms_empty(client):
    response = client.get("/api/v1/forms")
    assert response.status_code == 200
    assert response.json() == []

def test_create_form(client):
    response = client.post("/api/v1/forms", json={"title": "My New Form"})
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "My New Form"
    assert data["status"] == "draft"
    assert "id" in data
    assert "slug" in data
    assert data["response_count"] == 0

def test_create_form_validation(client):
    response = client.post("/api/v1/forms", json={"title": ""})
    assert response.status_code == 422 # Unprocessable Entity

def test_get_form(client):
    create_resp = client.post("/api/v1/forms", json={"title": "Test Form"})
    form_id = create_resp.json()["id"]

    response = client.get(f"/api/v1/forms/{form_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == form_id
    assert data["title"] == "Test Form"
    assert "questions" in data
    assert len(data["questions"]) == 0

def test_get_form_not_found(client):
    response = client.get("/api/v1/forms/invalid-id")
    assert response.status_code == 404

def test_update_form(client):
    create_resp = client.post("/api/v1/forms", json={"title": "Old Title"})
    form_id = create_resp.json()["id"]

    response = client.patch(f"/api/v1/forms/{form_id}", json={"title": "New Title", "description": "New Desc"})
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "New Title"
    assert data["description"] == "New Desc"

def test_delete_form(client):
    create_resp = client.post("/api/v1/forms", json={"title": "To Delete"})
    form_id = create_resp.json()["id"]

    del_resp = client.delete(f"/api/v1/forms/{form_id}")
    assert del_resp.status_code == 204

    get_resp = client.get(f"/api/v1/forms/{form_id}")
    assert get_resp.status_code == 404

def test_duplicate_form(client, db_session):
    create_resp = client.post("/api/v1/forms", json={"title": "Original Form"})
    form_id = create_resp.json()["id"]
    
    # Add a question directly via DB to test duplication of questions
    form = db_session.query(Form).filter_by(id=form_id).first()
    q1 = Question(form_id=form.id, type=QuestionType.SHORT_TEXT, title="Q1", order_index=1)
    db_session.add(q1)
    
    # Add a response to ensure responses are NOT duplicated
    r1 = Response(form_id=form.id)
    db_session.add(r1)
    db_session.commit()
    
    dup_resp = client.post(f"/api/v1/forms/{form_id}/duplicate")
    assert dup_resp.status_code == 201
    dup_data = dup_resp.json()
    
    assert dup_data["id"] != form_id
    assert dup_data["slug"] != create_resp.json()["slug"]
    assert dup_data["title"] == "Original Form (Copy)"
    assert dup_data["status"] == "draft"
    assert dup_data["response_count"] == 0
    assert len(dup_data["questions"]) == 1
    assert dup_data["questions"][0]["title"] == "Q1"
    
def test_other_creator_form_access(client, db_session):
    # Create another creator manually and their form
    other_creator = Creator(name="Other")
    db_session.add(other_creator)
    db_session.commit()
    
    other_form = Form(creator_id=other_creator.id, title="Other Form", slug="other-slug")
    db_session.add(other_form)
    db_session.commit()
    
    # Getting via API (which uses Default Creator) should fail
    response = client.get(f"/api/v1/forms/{other_form.id}")
    assert response.status_code == 404

def test_regression_soft_delete_does_not_mutate_orm(client, db_session):
    create_resp = client.post("/api/v1/forms", json={"title": "Soft Delete Form"})
    form_id = create_resp.json()["id"]

    form = db_session.query(Form).filter_by(id=form_id).first()
    
    q1 = Question(form_id=form.id, type=QuestionType.SHORT_TEXT, title="Q1", order_index=1)
    q2 = Question(form_id=form.id, type=QuestionType.SHORT_TEXT, title="Q2", order_index=2)
    db_session.add_all([q1, q2])
    db_session.commit()

    resp = Response(form_id=form.id)
    db_session.add(resp)
    db_session.commit()

    ans2 = Answer(response_id=resp.id, question_id=q2.id, value="Some answer")
    db_session.add(ans2)
    db_session.commit()

    # soft delete Q2
    q2.is_deleted = True
    db_session.commit()

    # call GET /api/v1/forms/{id}
    response = client.get(f"/api/v1/forms/{form_id}")
    assert response.status_code == 200
    data = response.json()
    
    assert len(data["questions"]) == 1
    assert data["questions"][0]["title"] == "Q1"

    # query the database afterward to ensure ORM wasn't mutated such that Q2 was fully deleted
    db_q2 = db_session.query(Question).filter_by(id=q2.id).first()
    assert db_q2 is not None
    assert db_q2.is_deleted is True

    # historical Answer rows remain intact
    db_ans2 = db_session.query(Answer).filter_by(id=ans2.id).first()
    assert db_ans2 is not None
    assert db_ans2.value == "Some answer"

def test_other_creator_mutation_isolation(client, db_session):
    other_creator = Creator(name="Other")
    db_session.add(other_creator)
    db_session.commit()
    
    other_form = Form(creator_id=other_creator.id, title="Other Form", slug="other-slug2")
    db_session.add(other_form)
    db_session.commit()
    
    # PATCH another creator's form -> 404
    patch_resp = client.patch(f"/api/v1/forms/{other_form.id}", json={"title": "Hack"})
    assert patch_resp.status_code == 404

    # DELETE another creator's form -> 404
    del_resp = client.delete(f"/api/v1/forms/{other_form.id}")
    assert del_resp.status_code == 404
