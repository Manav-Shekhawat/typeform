from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.form import Form
from app.models.creator import Creator
from app.models.question import Question
from app.models.response import Response
import string
import random

def get_default_creator(db: Session) -> Creator:
    creator = db.query(Creator).filter(Creator.name == "Default Creator").first()
    if not creator:
        creator = Creator(name="Default Creator")
        db.add(creator)
        db.commit()
        db.refresh(creator)
    return creator

def generate_unique_slug(db: Session, base: str = "form") -> str:
    while True:
        suffix = ''.join(random.choices(string.ascii_lowercase + string.digits, k=6))
        slug = f"{base}-{suffix}"
        if not db.query(Form).filter(Form.slug == slug).first():
            return slug

class FormRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_forms_by_creator(self, creator_id: str):
        return self.db.query(Form).filter(Form.creator_id == creator_id).all()
        
    def get_form_by_id_and_creator(self, form_id: str, creator_id: str) -> Form | None:
        return self.db.query(Form).filter(Form.id == form_id, Form.creator_id == creator_id).first()

    def create_form(self, creator_id: str, title: str, description: str | None) -> Form:
        slug = generate_unique_slug(self.db, "form")
        form = Form(creator_id=creator_id, title=title, description=description, slug=slug)
        self.db.add(form)
        self.db.commit()
        self.db.refresh(form)
        return form

    def update_form(self, form: Form, title: str | None, description: str | None) -> Form:
        if title is not None:
            form.title = title
        if description is not None:
            form.description = description
        self.db.commit()
        self.db.refresh(form)
        return form

    def delete_form(self, form: Form):
        self.db.delete(form)
        self.db.commit()
        
    def duplicate_form(self, original_form: Form) -> Form:
        slug = generate_unique_slug(self.db, "form")
        new_form = Form(
            creator_id=original_form.creator_id,
            title=f"{original_form.title} (Copy)",
            description=original_form.description,
            slug=slug,
            theme_config=original_form.theme_config,
            thank_you_message=original_form.thank_you_message
        )
        self.db.add(new_form)
        
        active_questions = [q for q in original_form.questions if not q.is_deleted]
        for q in active_questions:
            new_q = Question(
                form=new_form,
                type=q.type,
                title=q.title,
                description=q.description,
                is_required=q.is_required,
                order_index=q.order_index,
                properties=q.properties
            )
            self.db.add(new_q)
            
        self.db.commit()
        self.db.refresh(new_form)
        return new_form
        
    def count_responses(self, form_id: str) -> int:
        return self.db.query(func.count(Response.id)).filter(Response.form_id == form_id).scalar()
