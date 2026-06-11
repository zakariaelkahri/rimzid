from datetime import datetime, timezone
from typing import List
from uuid import uuid4

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field, field_validator


app = FastAPI(title="RIMZID Backend", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:8080"],
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type"],
)


class Company(BaseModel):
    name: str
    phone: str
    email: EmailStr
    address: str
    services: List[str]


class ContactRequest(BaseModel):
    name: str = Field(..., min_length=1)
    email: EmailStr
    subject: str = ""
    message: str = Field(..., min_length=1)

    @field_validator("name", "message")
    @classmethod
    def require_text(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Ce champ est obligatoire.")
        return value

    @field_validator("subject")
    @classmethod
    def normalize_subject(cls, value: str) -> str:
        return value.strip()


class Contact(ContactRequest):
    id: str
    created_at: datetime


company = Company(
    name="RIMZID Ascenseur",
    phone="+212 5 39 93 22 75",
    email="service@rimzid.com",
    address="16 Rue Abdelaziz Taalabi, Fes",
    services=["Installation", "Modernisation", "Maintenance"],
)

contacts: list[Contact] = []


@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "rimzid-backend",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@app.get("/api/company", response_model=Company)
def get_company():
    return company


@app.post("/api/contact", status_code=201)
def create_contact(payload: ContactRequest):
    contact = Contact(
        **payload.model_dump(),
        id=str(uuid4()),
        created_at=datetime.now(timezone.utc),
    )
    contacts.append(contact)

    return {"message": "Votre demande a bien ete recue."}
