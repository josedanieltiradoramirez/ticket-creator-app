from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class IssueTypeCreate(BaseModel):
    name: str
    description: str
    form_template_id: Optional[int] = None
    category: str
    is_active: bool = True
    display_name: Optional[str] = None
    search_keywords: Optional[str] = None

class IssueTypeUpdate(BaseModel):
    name: str
    description: str
    form_template_id: Optional[int] = None
    category: str
    is_active: bool = True
    display_name: Optional[str] = None
    search_keywords: Optional[str] = None

class IssueTypeResponse(BaseModel):
    id: int
    name: str
    description: str
    form_template_id: Optional[int] = None
    category: str
    is_active: bool = True
    display_name: Optional[str] = None
    search_keywords: Optional[str] = None

    class Config:
        orm_mode = True