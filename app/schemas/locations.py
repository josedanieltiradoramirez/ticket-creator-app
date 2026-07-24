from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class LocationCreate(BaseModel):
    name: str
    city: str
    state: str
    code: str
    is_active: bool = True
    whs_system_id: Optional[int] = None

class LocationUpdate(BaseModel):
    name: str
    city: str
    state: str
    code: str
    is_active: bool
    whs_system_id: Optional[int] = None

class LocationResponse(BaseModel):
    id: int
    name: str
    city: str
    state: str
    code: str
    is_active: bool
    whs_system_id: Optional[int] = None

    class Config:
        orm_mode = True