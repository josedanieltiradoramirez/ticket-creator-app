from pydantic import BaseModel
from typing import Optional
from datetime import datetime

from app.schemas.form_fields import FormFieldResponse

class FormCreate(BaseModel):
    name: str
    description: str
    is_active: bool

class FormUpdate(BaseModel):
    name: str
    description: str
    is_active: bool

class FormResponse(BaseModel):
    id: int
    name: str
    description: str
    is_active: bool

    class Config:
        orm_mode = True

class FormDetailResponse(FormResponse):
    fields: list[FormFieldResponse]