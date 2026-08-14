from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api import forms
from app.api import questions
from app.api import public
from app.api import responses
from app.db.init_db import init_db, seed_db
from app.db.database import SessionLocal

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize the database on startup
    init_db()
    db = SessionLocal()
    try:
        seed_db(db)
    finally:
        db.close()
    yield

app = FastAPI(title=settings.app_name, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {"status": "healthy", "environment": settings.environment}

app.include_router(forms.router)
app.include_router(questions.router)
app.include_router(public.router)
app.include_router(responses.router)
