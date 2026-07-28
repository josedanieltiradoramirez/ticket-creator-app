from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class PriorityCreate(BaseModel):
    name: str

class PriorityUpdate(BaseModel):
    name: str

class PriorityResponse(BaseModel):
    id: int
    name: str

    model_config = ConfigDict(from_attributes=True)
  