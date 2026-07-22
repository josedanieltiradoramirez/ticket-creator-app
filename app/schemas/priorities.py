from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class PriorityCreate(BaseModel):
    name: str

class PriorityUpdate(BaseModel):
    name: str

class PriorityResponse(BaseModel):
    id: int
    name: str

    class Config:
        orm_mode = True
  