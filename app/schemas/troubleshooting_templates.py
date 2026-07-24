from pydantic import BaseModel, ConfigDict

from app.schemas.summaries import (
    ToolSummary,
    KnowledgeBaseSummary,
    IssueTypeSummary
)

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

    model_config = ConfigDict(from_attributes=True)


class TroubleshootingTemplateDetailResponse(TroubleshootingTemplateResponse):
    tools: list[ToolSummary]
    knowledge_base: list[KnowledgeBaseSummary]
    issue_types: list[IssueTypeSummary]