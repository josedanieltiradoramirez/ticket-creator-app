from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class TroubleshootingTemplateCreate(BaseModel):
    steps: str
    generated_description: str
    is_active: bool

class TroubleshootingTemplateUpdate(BaseModel):
    steps: str
    generated_description: str
    is_active: bool

class TroubleshootingTemplateResponse(BaseModel):
    id: int
    steps: str
    generated_description: str
    is_active: bool

    class Config:
        orm_mode = True