from pydantic import BaseModel, ConfigDict

from app.schemas.summaries import (
    ToolSummary,
    TroubleshootingTemplateSummary,
    IssueTypeSummary,
    TicketSummary
)

class KnowledgeBaseItemCreate(BaseModel):
    article_number: str
    title: str
    url: str
    description: str

class KnowledgeBaseItemUpdate(BaseModel):
    article_number: str | None = None
    title: str | None = None
    url: str | None = None
    description: str | None = None
    tools : list[int] | None = None
    troubleshooting_templates : list[int] | None = None
    issue_types : list[int] | None = None
    tickets : list[int] | None = None

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
    tickets: list[TicketSummary]