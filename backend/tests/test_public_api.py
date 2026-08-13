import pytest

@pytest.fixture
def published_form(client, db_session):
    # 1. Create a form
    resp = client.post("/api/v1/forms", json={"title": "Public Form", "description": "Desc"})
    form_id = resp.json()["id"]
    slug = resp.json()["slug"]
    
    # 2. Add questions of various types
    client.post(f"/api/v1/forms/{form_id}/questions", json={
        "type": "SHORT_TEXT", "title": "Q1", "order_index": 0
    })
    
    client.post(f"/api/v1/forms/{form_id}/questions", json={
        "type": "MULTIPLE_CHOICE", "title": "Q2", "order_index": 1,
        "properties": {"choices": ["A", "B", "C"]}
    })
    
    client.post(f"/api/v1/forms/{form_id}/questions", json={
        "type": "DROPDOWN", "title": "Q3", "order_index": 2,
        "properties": {"choices": ["X", "Y"]}
    })
    
    client.post(f"/api/v1/forms/{form_id}/questions", json={
        "type": "RATING", "title": "Q4", "order_index": 3,
        "properties": {"steps": 5}
    })
    
    client.post(f"/api/v1/forms/{form_id}/questions", json={
        "type": "NUMBER", "title": "Q5", "order_index": 4,
        "properties": {"min": 0, "max": 100}
    })

    # Add a soft-deleted question to verify exclusion
    q_del = client.post(f"/api/v1/forms/{form_id}/questions", json={
        "type": "YES_NO", "title": "Deleted", "order_index": 5
    }).json()["id"]
    client.delete(f"/api/v1/forms/{form_id}/questions/{q_del}")
    
    # Update some metadata directly in DB for testing
    from app.models.form import Form
    form = db_session.query(Form).filter_by(id=form_id).first()
    form.theme_config = {"color": "blue"}
    form.thank_you_message = "Thanks!"
    db_session.commit()

    # Publish
    client.post(f"/api/v1/forms/{form_id}/publish")
    
    return {"id": form_id, "slug": slug}


def test_public_form_retrieval(client, published_form):
    slug = published_form["slug"]
    
    # 1. Published form can be retrieved
    resp = client.get(f"/api/v1/public/forms/{slug}")
    assert resp.status_code == 200
    data = resp.json()
    
    # 2. Correct title/description returned
    assert data["title"] == "Public Form"
    assert data["description"] == "Desc"
    
    # 3. Correct thank-you message returned
    assert data["thank_you_message"] == "Thanks!"
    
    # 4. Correct theme configuration returned
    assert data["theme_config"] == {"color": "blue"}
    
    # 5. Questions are returned
    questions = data["questions"]
    assert len(questions) == 5
    
    # 6. Questions are ordered by order_index
    for i in range(5):
        assert questions[i]["order_index"] == i
        
    # 7. Soft-deleted questions are excluded
    assert not any(q["title"] == "Deleted" for q in questions)
    
    # 10. Creator/admin fields are NOT exposed
    assert "creator_id" not in data
    
    # 11. response_count is NOT exposed
    assert "response_count" not in data
    
    # 12. status is NOT exposed
    assert "status" not in data
    
    # 14-18. Question properties correctly returned
    assert questions[1]["type"] == "MULTIPLE_CHOICE"
    assert questions[1]["properties"]["choices"] == ["A", "B", "C"]
    
    assert questions[2]["type"] == "DROPDOWN"
    assert questions[2]["properties"]["choices"] == ["X", "Y"]
    
    assert questions[3]["type"] == "RATING"
    assert questions[3]["properties"]["steps"] == 5
    
    assert questions[4]["type"] == "NUMBER"
    assert questions[4]["properties"]["min"] == 0
    assert questions[4]["properties"]["max"] == 100

def test_draft_form_returns_404(client):
    # Create draft
    resp = client.post("/api/v1/forms", json={"title": "Draft Form"})
    slug = resp.json()["slug"]
    
    # 8. Draft form returns 404
    public_resp = client.get(f"/api/v1/public/forms/{slug}")
    assert public_resp.status_code == 404
    assert public_resp.json()["detail"] == "Form not found"

def test_unknown_slug_returns_404(client):
    # 9. Unknown slug returns 404
    public_resp = client.get("/api/v1/public/forms/non-existent-slug-123")
    assert public_resp.status_code == 404
    assert public_resp.json()["detail"] == "Form not found"
