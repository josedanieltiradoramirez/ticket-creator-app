from pydantic import BaseModel
from typing import Optional

from app.schemas.forms import FormResponse

from app.schemas.summaries import (
    ToolSummary,
    KnowledgeBaseSummary,
    TroubleshootingTemplateSummary
)

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
    tools: list[ToolSummary]
    troubleshooting_templates: list[TroubleshootingTemplateSummary]
    knowledge_base: list[KnowledgeBaseSummary]