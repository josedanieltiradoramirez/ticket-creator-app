from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class LocationCreate(BaseModel):
    name: str
    city: str
    state: str
    code: str
    is_active: bool = True

class LocationUpdate(BaseModel):
    name: str
    city: str
    state: str
    code: str
    is_active: bool

class LocationResponse(BaseModel):
    id: int
    name: str
    city: str
    state: str
    code: str
    is_active: bool

    class Config:
        orm_mode = True