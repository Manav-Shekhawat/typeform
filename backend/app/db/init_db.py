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
        print("Default Creator seeded.")
    else:
        print("Default Creator already exists.")

if __name__ == "__main__":
    from app.db.database import SessionLocal
    print("Initializing database...")
    init_db()
    db = SessionLocal()
    seed_db(db)
    db.close()
    print("Database initialized and seeded.")
