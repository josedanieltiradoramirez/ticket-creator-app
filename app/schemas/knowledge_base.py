from pydantic import BaseModel, ConfigDict

from app.schemas.summaries import (
    ToolSummary,
    TroubleshootingTemplateSummary,
    IssueTypeSummary
)

class KnowledgeBaseItemCreate(BaseModel):
    article_number: str
    title: str
    url: str
    description: str

class KnowledgeBaseItemUpdate(BaseModel):
    article_number: str
    title: str
    url: str
    description: str

class KnowledgeBaseItemResponse(BaseModel):
    id: int
    article_number: str
    title: str
    url: str
    description: str

    model_config = ConfigDict(from_attributes=True)

class KnowledgeBaseDetailResponse(KnowledgeBaseItemResponse):
    tools: list[ToolSummary]
    troubleshooting_templates: list[TroubleshootingTemplateSummary]
    issue_types: list[IssueTypeSummary]