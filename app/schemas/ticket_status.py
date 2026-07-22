from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class TicketStatusCreate(BaseModel):
    name: str

class TicketStatusUpdate(BaseModel):
    name: str

class TicketStatusResponse(BaseModel):
    id: int
    name: str

    class Config:
        orm_mode = True