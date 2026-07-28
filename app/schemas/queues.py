from pydantic import BaseModel, ConfigDict
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

    model_config = ConfigDict(from_attributes=True)