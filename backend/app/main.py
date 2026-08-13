from fastapi import FastAPI
from app.core.config import settings
from app.api import forms
from app.api import questions
from app.api import public
from app.api import responses

app = FastAPI(title=settings.app_name)

@app.get("/health")
def health_check():
    return {"status": "healthy", "environment": settings.environment}

app.include_router(forms.router)
app.include_router(questions.router)
app.include_router(public.router)
app.include_router(responses.router)
