from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ToolCreate(BaseModel):
    name: str
    description: str
    is_active: bool = True

class ToolUpdate(BaseModel):
    name: str
    description: str
    is_active: bool

class ToolResponse(BaseModel):
    id: int
    name: str
    description: str
    is_active: bool

    class Config:
        orm_mode = True