from pydantic import BaseModel, ConfigDict

from app.schemas.summaries import (
    ToolSummary,
    KnowledgeBaseSummary,
    IssueTypeSummary
)

class TroubleshootingTemplateCreate(BaseModel):
    name: str | None = None
    steps: str
    generated_description: str
    is_active: bool

class TroubleshootingTemplateUpdate(BaseModel):
    name: str | None = None
    steps: str
    generated_description: str
    is_active: bool
    issue_types: list[int] = []

class TroubleshootingTemplateResponse(BaseModel):
    name: str | None = None
    id: int
    steps: str
    generated_description: str
    is_active: bool

    model_config = ConfigDict(from_attributes=True)


class TroubleshootingTemplateDetailResponse(TroubleshootingTemplateResponse):
    tools: list[ToolSummary]
    knowledge_base: list[KnowledgeBaseSummary]
    issue_types: list[IssueTypeSummary]