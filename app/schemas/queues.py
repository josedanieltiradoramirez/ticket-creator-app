from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class QueueCreate(BaseModel):
    name: str
    description: str
    is_active: bool

class QueueUpdate(BaseModel):
    name: str
    description: str
    is_active: bool

class QueueResponse(BaseModel):
    id: int
    name: str
    description: str
    is_active: bool

    class Config:
        orm_mode = True