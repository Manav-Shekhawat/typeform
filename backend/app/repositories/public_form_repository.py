from sqlalchemy.orm import Session
from app.models.form import Form

class PublicFormRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_form_by_slug(self, slug: str) -> Form | None:
        return self.db.query(Form).filter(Form.slug == slug).first()
