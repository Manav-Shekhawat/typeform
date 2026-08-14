from sqlalchemy.orm import Session
from app.db.database import engine, Base
from app.models.creator import Creator
from app.models import Form, Question, Response, Answer # ensure all models are imported so Base metadata knows them

def init_db():
    Base.metadata.create_all(bind=engine)

def seed_db(db: Session):
    creator = db.query(Creator).first()
    if not creator:
        creator = Creator(name="Default Creator")
        db.add(creator)
        db.commit()
        db.refresh(creator)
        print("Default Creator seeded.")
    else:
        print("Default Creator already exists.")

    from app.models.form import Form, FormStatus
    from app.models.question import Question, QuestionType
    from app.models.response import Response
    from app.models.answer import Answer
    import uuid

    existing_forms = db.query(Form).filter(Form.creator_id == creator.id).count()
    if existing_forms > 0:
        print("Demo data already exists.")
        return

    # Form 1
    form1 = Form(creator_id=creator.id, title="Customer Feedback", description="We value your feedback!", slug="customer-feedback-" + str(uuid.uuid4())[:8], status=FormStatus.published, theme_config={}, thank_you_message="Thank you for your feedback!")
    db.add(form1)
    db.commit()
    db.refresh(form1)

    q1_1 = Question(form_id=form1.id, type=QuestionType.SHORT_TEXT, title="Name", is_required=True, order_index=0)
    q1_2 = Question(form_id=form1.id, type=QuestionType.EMAIL, title="Email", is_required=True, order_index=1)
    q1_3 = Question(form_id=form1.id, type=QuestionType.MULTIPLE_CHOICE, title="Experience", is_required=True, order_index=2, properties={"choices": ["Excellent", "Good", "Average", "Poor"]})
    q1_4 = Question(form_id=form1.id, type=QuestionType.YES_NO, title="Would Recommend", is_required=False, order_index=3)
    q1_5 = Question(form_id=form1.id, type=QuestionType.RATING, title="Rating", is_required=True, order_index=4, properties={"steps": 5})
    db.add_all([q1_1, q1_2, q1_3, q1_4, q1_5])
    db.commit()
    
    # Form 2
    form2 = Form(creator_id=creator.id, title="Employee Survey", description="Internal survey for Q3", slug="employee-survey-" + str(uuid.uuid4())[:8], status=FormStatus.published, theme_config={}, thank_you_message="Thanks for participating!")
    db.add(form2)
    db.commit()
    db.refresh(form2)

    q2_1 = Question(form_id=form2.id, type=QuestionType.SHORT_TEXT, title="Name", is_required=False, order_index=0)
    q2_2 = Question(form_id=form2.id, type=QuestionType.DROPDOWN, title="Department", is_required=True, order_index=1, properties={"choices": ["Engineering", "Sales", "Marketing", "HR"]})
    q2_3 = Question(form_id=form2.id, type=QuestionType.NUMBER, title="Years of Experience", is_required=True, order_index=2, properties={"min": 0, "max": 50})
    q2_4 = Question(form_id=form2.id, type=QuestionType.LONG_TEXT, title="Feedback", is_required=False, order_index=3)
    q2_5 = Question(form_id=form2.id, type=QuestionType.RATING, title="Satisfaction", is_required=True, order_index=4, properties={"steps": 10})
    db.add_all([q2_1, q2_2, q2_3, q2_4, q2_5])
    db.commit()

    # Responses F1
    r1 = Response(form_id=form1.id)
    db.add(r1)
    db.commit()
    db.add_all([Answer(response_id=r1.id, question_id=q1_1.id, value="Alice"), Answer(response_id=r1.id, question_id=q1_2.id, value="alice@test.com"), Answer(response_id=r1.id, question_id=q1_3.id, value="Excellent"), Answer(response_id=r1.id, question_id=q1_4.id, value="true"), Answer(response_id=r1.id, question_id=q1_5.id, value="5")])
    
    # Responses F2
    r2 = Response(form_id=form2.id)
    db.add(r2)
    db.commit()
    db.add_all([Answer(response_id=r2.id, question_id=q2_1.id, value="Bob"), Answer(response_id=r2.id, question_id=q2_2.id, value="Engineering"), Answer(response_id=r2.id, question_id=q2_3.id, value="4"), Answer(response_id=r2.id, question_id=q2_4.id, value="Great"), Answer(response_id=r2.id, question_id=q2_5.id, value="8")])
    db.commit()
    print("Demo data seeded.")

if __name__ == "__main__":
    from app.db.database import SessionLocal
    print("Initializing database...")
    init_db()
    db = SessionLocal()
    seed_db(db)
    db.close()
    print("Database initialized and seeded.")
