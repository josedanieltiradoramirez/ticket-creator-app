from pydantic import BaseModel
from typing import Optional
from datetime import datetime

from app.schemas.summaries import (
    IssueTypeSummary,
    KnowledgeBaseSummary,
    TroubleshootingTemplateSummary
)

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

class ToolDetailResponse(ToolResponse):
    issue_types: list[IssueTypeSummary]
    troubleshooting_templates: list[TroubleshootingTemplateSummary]
    knowledge_base: list[KnowledgeBaseSummary]