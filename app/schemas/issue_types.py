from pydantic import BaseModel
from typing import Optional
from datetime import datetime

from app.schemas.forms import FormResponse
from app.schemas.knowledge_base import KnowledgeBaseItemResponse
from app.schemas.tools import ToolResponse
from app.schemas.troubleshooting_templates import TroubleshootingTemplateResponse
from app.schemas.troubleshooting_templates import TroubleshootingTemplateResponse

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

class IssueTypeDetailResponse(IssueTypeResponse):
    form: FormResponse
    tools: list[ToolResponse]
    troubleshooting_templates: list[TroubleshootingTemplateResponse]
    knowledge_base: list[KnowledgeBaseItemResponse]