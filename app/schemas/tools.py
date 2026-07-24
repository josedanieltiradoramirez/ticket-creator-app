from pydantic import BaseModel, ConfigDict

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

    model_config = ConfigDict(from_attributes=True)

class ToolDetailResponse(ToolResponse):
    issue_types: list[IssueTypeSummary]
    troubleshooting_templates: list[TroubleshootingTemplateSummary]
    knowledge_base: list[KnowledgeBaseSummary]