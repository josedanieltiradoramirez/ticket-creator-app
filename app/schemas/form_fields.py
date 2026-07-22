from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class FormFieldCreate(BaseModel):
    form_id: int
    label: str
    field_type: str
    required: bool
    display_order: int

class FormFieldUpdate(BaseModel):
    form_id: int
    label: str
    field_type: str
    required: bool
    display_order: int

class FormFieldResponse(BaseModel):
    id: int
    form_id: int
    label: str
    field_type: str
    required: bool
    display_order: int

    class Config:
        orm_mode = True