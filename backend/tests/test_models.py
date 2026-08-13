import pytest
from sqlalchemy.exc import IntegrityError
from app.models.creator import Creator
from app.models.form import Form, FormStatus
from app.models.question import Question, QuestionType
from app.models.response import Response
from app.models.answer import Answer

def test_creator_can_exist(db_session):
    creator = Creator(name="Default Creator")
    db_session.add(creator)
    db_session.commit()
    assert creator.id is not None
    assert creator.name == "Default Creator"

def test_form_belongs_to_creator(db_session):
    creator = Creator(name="Default Creator")
    db_session.add(creator)
    db_session.commit()

    form = Form(creator_id=creator.id, title="Feedback", slug="feedback-1")
    db_session.add(form)
    db_session.commit()

    assert form.creator_id == creator.id
    assert form.creator.name == "Default Creator"
    assert len(creator.forms) == 1

def test_question_order_uniqueness(db_session):
    creator = Creator(name="Default Creator")
    db_session.add(creator)
    db_session.commit()
    
    form = Form(creator_id=creator.id, title="Feedback", slug="feedback-1")
    db_session.add(form)
    db_session.commit()

    q1 = Question(form_id=form.id, type=QuestionType.SHORT_TEXT, title="Q1", order_index=1)
    db_session.add(q1)
    db_session.commit()

    q2 = Question(form_id=form.id, type=QuestionType.SHORT_TEXT, title="Q2", order_index=1)
    db_session.add(q2)
    with pytest.raises(IntegrityError):
        db_session.commit()
    db_session.rollback()

def test_answer_uniqueness_and_relationships(db_session):
    creator = Creator(name="Default Creator")
    db_session.add(creator)
    db_session.commit()
    
    form = Form(creator_id=creator.id, title="Feedback", slug="feedback-1")
    db_session.add(form)
    db_session.commit()

    q1 = Question(form_id=form.id, type=QuestionType.SHORT_TEXT, title="Q1", order_index=1)
    db_session.add(q1)
    
    resp = Response(form_id=form.id)
    db_session.add(resp)
    db_session.commit()

    ans1 = Answer(response_id=resp.id, question_id=q1.id, value="Answer 1")
    db_session.add(ans1)
    db_session.commit()

    assert ans1.response_id == resp.id
    assert ans1.question_id == q1.id
    assert ans1 in resp.answers

    # Test uniqueness
    ans2 = Answer(response_id=resp.id, question_id=q1.id, value="Answer 2")
    db_session.add(ans2)
    with pytest.raises(IntegrityError):
        db_session.commit()
    db_session.rollback()

def test_soft_deleted_questions(db_session):
    creator = Creator(name="Default Creator")
    db_session.add(creator)
    db_session.commit()
    
    form = Form(creator_id=creator.id, title="Feedback", slug="feedback-1")
    db_session.add(form)
    db_session.commit()

    q1 = Question(form_id=form.id, type=QuestionType.SHORT_TEXT, title="Active Q", order_index=1)
    q2 = Question(form_id=form.id, type=QuestionType.SHORT_TEXT, title="Deleted Q", order_index=2, is_deleted=True)
    db_session.add_all([q1, q2])
    db_session.commit()

    # Simulating a normal active-question query
    active_questions = db_session.query(Question).filter_by(form_id=form.id, is_deleted=False).all()
    assert len(active_questions) == 1
    assert active_questions[0].title == "Active Q"

    # Verify q2 still exists in DB
    all_questions = db_session.query(Question).filter_by(form_id=form.id).all()
    assert len(all_questions) == 2

def test_historical_answers_remain_after_soft_delete(db_session):
    creator = Creator(name="Default Creator")
    db_session.add(creator)
    db_session.commit()
    
    form = Form(creator_id=creator.id, title="Feedback", slug="feedback-1")
    db_session.add(form)
    db_session.commit()

    q1 = Question(form_id=form.id, type=QuestionType.SHORT_TEXT, title="Q1", order_index=1)
    db_session.add(q1)
    db_session.commit()
    
    resp = Response(form_id=form.id)
    db_session.add(resp)
    db_session.commit()

    ans = Answer(response_id=resp.id, question_id=q1.id, value="Historical Value")
    db_session.add(ans)
    db_session.commit()

    # Now soft delete the question
    q1.is_deleted = True
    db_session.commit()

    # Answer should still be there
    saved_ans = db_session.query(Answer).filter_by(id=ans.id).first()
    assert saved_ans is not None
    assert saved_ans.value == "Historical Value"
    assert saved_ans.question_id == q1.id

def test_form_deletion_cascades_to_questions_responses_and_answers(
    db_session,
):
    creator = Creator(
        name="Test Creator",
    )
    db_session.add(creator)
    db_session.flush()

    form = Form(
        creator_id=creator.id,
        title="Test Form",
        slug="test-form-delete",
        status="draft",
    )
    db_session.add(form)
    db_session.flush()

    question = Question(
        form_id=form.id,
        type=QuestionType.SHORT_TEXT,
        title="What is your name?",
        is_required=True,
        order_index=0,
        properties={},
    )
    db_session.add(question)
    db_session.flush()

    response = Response(
        form_id=form.id,
    )
    db_session.add(response)
    db_session.flush()

    answer = Answer(
        response_id=response.id,
        question_id=question.id,
        value="Manav",
    )
    db_session.add(answer)
    db_session.commit()

    # Delete the entire form.
    db_session.delete(form)
    db_session.commit()

    # Verify all dependent records were removed.
    assert db_session.get(Form, form.id) is None
    assert db_session.get(Question, question.id) is None
    assert db_session.get(Response, response.id) is None
    assert db_session.get(Answer, answer.id) is None