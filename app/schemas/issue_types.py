from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class TroubleshootingTemplateCreate(BaseModel):
    name: str
    description: str
    form_template_id: Optional[int] = None
    category: str
    is_active: bool = True
    display_name: Optional[str] = None
    searchable_keywords: Optional[str] = None

class TroubleshootingTemplateUpdate(BaseModel):
    name: str
    description: str
    form_template_id: Optional[int] = None
    category: str
    is_active: bool = True
    display_name: Optional[str] = None
    searchable_keywords: Optional[str] = None

class TroubleshootingTemplateResponse(BaseModel):
    id: int
    name: str
    description: str
    form_template_id: Optional[int] = None
    category: str
    is_active: bool = True
    display_name: Optional[str] = None
    searchable_keywords: Optional[str] = None

    class Config:
        orm_mode = True