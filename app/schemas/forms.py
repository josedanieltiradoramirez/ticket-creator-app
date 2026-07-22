from pydantic import BaseModel
from typing import Optional
from datetime import datetime

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