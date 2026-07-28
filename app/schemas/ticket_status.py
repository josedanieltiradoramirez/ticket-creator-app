from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class TicketStatusCreate(BaseModel):
    name: str

class TicketStatusUpdate(BaseModel):
    name: str

class TicketStatusResponse(BaseModel):
    id: int
    name: str

    model_config = ConfigDict(from_attributes=True)