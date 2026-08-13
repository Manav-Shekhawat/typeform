from fastapi import FastAPI
from app.core.config import settings
from app.api import forms

app = FastAPI(title=settings.app_name)

@app.get("/health")
def health_check():
    return {"status": "healthy", "environment": settings.environment}

app.include_router(forms.router)
