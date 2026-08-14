import pytest
from app.models.creator import Creator
from app.models.form import Form
from app.models.question import Question, QuestionType
from app.repositories.form_repository import get_default_creator

@pytest.fixture
def test_data(client, db_session):
    # 1. Create Default Creator
    creator = get_default_creator(db_session)
    
    # 2. Create Form
    form = Form(creator_id=creator.id, title="Results Form", slug="res-slug", status="published")
    db_session.add(form)
    db_session.commit()
    
    # 3. Create Questions
    qs = [
        Question(form_id=form.id, type=QuestionType.SHORT_TEXT, title="Q_SHORT", order_index=1, is_required=True),
        Question(form_id=form.id, type=QuestionType.LONG_TEXT, title="Q_LONG", order_index=2, is_required=True),
        Question(form_id=form.id, type=QuestionType.EMAIL, title="Q_EMAIL", order_index=3, is_required=True),
        Question(form_id=form.id, type=QuestionType.NUMBER, title="Q_NUM", order_index=4, is_required=True, properties={"min": 0, "max": 100}),
        Question(form_id=form.id, type=QuestionType.YES_NO, title="Q_YN", order_index=5, is_required=True),
        Question(form_id=form.id, type=QuestionType.MULTIPLE_CHOICE, title="Q_MC", order_index=6, is_required=True, properties={"choices": ["A", "B", "C"]}),
        Question(form_id=form.id, type=QuestionType.DROPDOWN, title="Q_DROP", order_index=7, is_required=True, properties={"choices": ["X", "Y"]}),
        Question(form_id=form.id, type=QuestionType.RATING, title="Q_RATE", order_index=8, is_required=True, properties={"steps": 5}),
        Question(form_id=form.id, type=QuestionType.SHORT_TEXT, title="Q_HIST", order_index=9, is_required=False)
    ]
    db_session.add_all(qs)
    db_session.commit()
    
    q_map = {q.title: str(q.id) for q in qs}
    
    # 4. Submit Response 1
    resp1_payload = {
        "answers": [
            {"question_id": q_map["Q_SHORT"], "value": "s1"},
            {"question_id": q_map["Q_LONG"], "value": "l1"},
            {"question_id": q_map["Q_EMAIL"], "value": "1@e.com"},
            {"question_id": q_map["Q_NUM"], "value": 10},
            {"question_id": q_map["Q_YN"], "value": True},
            {"question_id": q_map["Q_MC"], "value": "A"},
            {"question_id": q_map["Q_DROP"], "value": "X"},
            {"question_id": q_map["Q_RATE"], "value": 4},
            {"question_id": q_map["Q_HIST"], "value": "historical answer"}
        ]
    }
    r1 = client.post(f"/api/v1/public/forms/res-slug/responses", json=resp1_payload)
    resp1_id = r1.json()["id"]
    
    # 5. Submit Response 2 (Empty optional, different values)
    resp2_payload = {
        "answers": [
            {"question_id": q_map["Q_SHORT"], "value": "s2"},
            {"question_id": q_map["Q_LONG"], "value": "l2"},
            {"question_id": q_map["Q_EMAIL"], "value": "2@e.com"},
            {"question_id": q_map["Q_NUM"], "value": 20},
            {"question_id": q_map["Q_YN"], "value": False},
            {"question_id": q_map["Q_MC"], "value": "B"},
            {"question_id": q_map["Q_DROP"], "value": "Y"},
            {"question_id": q_map["Q_RATE"], "value": 2}
        ]
    }
    r2 = client.post(f"/api/v1/public/forms/res-slug/responses", json=resp2_payload)
    resp2_id = r2.json()["id"]
    
    # 6. Soft delete Q_HIST so we can test historical visibility
    q_hist = db_session.query(Question).filter_by(id=q_map["Q_HIST"]).first()
    q_hist.is_deleted = True
    db_session.commit()
    
    # 7. Create another creator and form
    other_creator = Creator(name="Other")
    db_session.add(other_creator)
    db_session.commit()
    other_form = Form(creator_id=other_creator.id, title="Other Form", slug="oth-slug", status="published")
    db_session.add(other_form)
    db_session.commit()
    other_q = Question(form_id=other_form.id, type=QuestionType.SHORT_TEXT, title="OQ", order_index=1, is_required=True)
    db_session.add(other_q)
    db_session.commit()
    
    # Submit to other form
    r3 = client.post(f"/api/v1/public/forms/oth-slug/responses", json={"answers": [{"question_id": str(other_q.id), "value": "oth"}]})
    other_resp_id = r3.json()["id"]
    
    return {
        "form_id": form.id,
        "q_map": q_map,
        "resp1_id": resp1_id,
        "resp2_id": resp2_id,
        "other_form_id": other_form.id,
        "other_resp_id": other_resp_id
    }

# RESPONSE LIST
def test_list_responses(client, test_data):
    # 1. List responses for a form
    # 3. Ordered deterministically (newest first based on repository implementation)
    # 4. Answers are included
    resp = client.get(f"/api/v1/forms/{test_data['form_id']}/responses")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) == 2
    assert data[0]["id"] == test_data["resp2_id"] # Newest first
    assert data[1]["id"] == test_data["resp1_id"]
    
    # Check answers for resp1
    answers = data[1]["answers"]
    assert len(answers) == 9
    
    # Check answers for resp2
    answers = data[0]["answers"]
    assert len(answers) == 8

def test_empty_form_returns_empty_response_list(client, db_session):
    # 2. Empty form returns empty response list
    creator = get_default_creator(db_session)
    form = Form(creator_id=creator.id, title="Empty", slug="emp")
    db_session.add(form)
    db_session.commit()
    
    resp = client.get(f"/api/v1/forms/{form.id}/responses")
    assert resp.status_code == 200
    assert resp.json() == []

def test_another_creator_form_list_returns_404(client, test_data):
    # 5. Another creator's form returns 404
    resp = client.get(f"/api/v1/forms/{test_data['other_form_id']}/responses")
    assert resp.status_code == 404

# INDIVIDUAL RESPONSE
def test_retrieve_one_response(client, test_data):
    # 6. Retrieve one response
    resp = client.get(f"/api/v1/forms/{test_data['form_id']}/responses/{test_data['resp1_id']}")
    assert resp.status_code == 200
    data = resp.json()
    
    # 9. Answer values are returned correctly
    # 10. Question title/type are included
    ans = next(a for a in data["answers"] if a["question_id"] == test_data["q_map"]["Q_SHORT"])
    assert ans["value"] == "s1"
    assert ans["question_title"] == "Q_SHORT"
    assert ans["question_type"] == "SHORT_TEXT"
    
    # 11. Historical answer remains visible after question soft deletion
    hist_ans = next(a for a in data["answers"] if a["question_id"] == test_data["q_map"]["Q_HIST"])
    assert hist_ans["value"] == "historical answer"
    assert hist_ans["question_title"] == "Q_HIST"
    
def test_unknown_response_returns_404(client, test_data):
    # 7. Unknown response returns 404
    resp = client.get(f"/api/v1/forms/{test_data['form_id']}/responses/unknown-id")
    assert resp.status_code == 404

def test_response_from_another_form_returns_404(client, test_data):
    # 8. Response from another form returns 404
    resp = client.get(f"/api/v1/forms/{test_data['form_id']}/responses/{test_data['other_resp_id']}")
    assert resp.status_code == 404

# STATISTICS
def test_empty_form_returns_zero_statistics(client, db_session):
    # 12. Empty form returns zero statistics
    creator = get_default_creator(db_session)
    form = Form(creator_id=creator.id, title="EmptyStats", slug="emp-stats")
    db_session.add(form)
    db_session.commit()
    q = Question(form_id=form.id, type=QuestionType.NUMBER, title="Q1", order_index=1)
    db_session.add(q)
    db_session.commit()
    
    resp = client.get(f"/api/v1/forms/{form.id}/stats")
    assert resp.status_code == 200
    stats = resp.json()["questions"]
    assert len(stats) == 1
    
    # 24. Numeric stats with no answers return null aggregates
    assert stats[0]["response_count"] == 0
    assert stats[0].get("average") is None
    assert stats[0].get("minimum") is None
    assert stats[0].get("maximum") is None

def test_statistics(client, test_data):
    resp = client.get(f"/api/v1/forms/{test_data['form_id']}/stats")
    assert resp.status_code == 200
    stats = {q["question_id"]: q for q in resp.json()["questions"]}
    
    q_map = test_data["q_map"]
    
    # 13. SHORT_TEXT response count
    assert stats[q_map["Q_SHORT"]]["response_count"] == 2
    
    # 14. LONG_TEXT response count
    assert stats[q_map["Q_LONG"]]["response_count"] == 2
    
    # 15. EMAIL response count
    assert stats[q_map["Q_EMAIL"]]["response_count"] == 2
    
    # 16. NUMBER count/average/min/max
    num_stat = stats[q_map["Q_NUM"]]
    assert num_stat["response_count"] == 2
    assert num_stat["average"] == 15.0
    assert num_stat["minimum"] == 10.0
    assert num_stat["maximum"] == 20.0
    
    # 17. YES_NO true/false counts
    yn_stat = stats[q_map["Q_YN"]]
    assert yn_stat["response_count"] == 2
    assert yn_stat["true_count"] == 1
    assert yn_stat["false_count"] == 1
    
    # 18. MULTIPLE_CHOICE counts
    # 22. Choice options with zero responses are still returned
    mc_stat = stats[q_map["Q_MC"]]
    assert mc_stat["response_count"] == 2
    assert mc_stat["choice_counts"] == {"A": 1, "B": 1, "C": 0}
    
    # 19. DROPDOWN counts
    drop_stat = stats[q_map["Q_DROP"]]
    assert drop_stat["response_count"] == 2
    assert drop_stat["choice_counts"] == {"X": 1, "Y": 1}
    
    # 20. RATING distribution
    # 21. RATING average
    # 23. Rating values with zero responses are still returned
    rate_stat = stats[q_map["Q_RATE"]]
    assert rate_stat["response_count"] == 2
    assert rate_stat["average"] == 3.0
    assert rate_stat["distribution"] == {"1": 0, "2": 1, "3": 0, "4": 1, "5": 0}

    # Regression test: soft-deleted questions should not appear in stats
    assert q_map["Q_HIST"] not in stats

def test_other_creator_stats_returns_404(client, test_data):
    # 25. Other creator cannot access stats
    resp = client.get(f"/api/v1/forms/{test_data['other_form_id']}/stats")
    assert resp.status_code == 404

# INTEGRITY
def test_responses_from_another_form_never_returned(client, test_data):
    # 26. Responses from another form are never returned
    resp = client.get(f"/api/v1/forms/{test_data['form_id']}/responses")
    data = resp.json()
    assert len(data) == 2
    for r in data:
        assert r["id"] != test_data["other_resp_id"]

def test_answers_from_another_response_never_returned(client, test_data):
    # 27. Answers from another response are never returned
    resp = client.get(f"/api/v1/forms/{test_data['form_id']}/responses/{test_data['resp2_id']}")
    data = resp.json()
    assert len(data["answers"]) == 8
    # resp2 should not have Q_HIST
    assert not any(a["question_id"] == test_data["q_map"]["Q_HIST"] for a in data["answers"])
