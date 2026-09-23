from pydantic import BaseModel, ConfigDict
from typing import Optional

from app.schemas.summaries import (
    IssueTypeSummary,
    KnowledgeBaseSummary,
    TroubleshootingTemplateSummary
)


class ToolCreate(BaseModel):
    name: str
    description: str
    access_request: Optional[str] = None
    password_reset: Optional[str] = None
    is_active: bool = True


class ToolUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    access_request: Optional[str] = None
    password_reset: Optional[str] = None
    is_active: Optional[bool] = None


class ToolResponse(BaseModel):
    id: int
    name: str
    description: str
    access_request: Optional[str] = None
    password_reset: Optional[str] = None
    is_active: bool

    model_config = ConfigDict(from_attributes=True)


class ToolDetailResponse(ToolResponse):
    issue_types: list[IssueTypeSummary]
    troubleshooting_templates: list[TroubleshootingTemplateSummary]
    knowledge_base: list[KnowledgeBaseSummary]