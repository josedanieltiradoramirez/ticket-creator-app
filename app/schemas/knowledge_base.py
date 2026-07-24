from pydantic import BaseModel

from app.schemas.summaries import (
    ToolSummary,
    TroubleshootingTemplateSummary
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

    class Config:
        orm_mode = True

class KnowledgeBaseDetailResponse(KnowledgeBaseItemResponse):
    tools: list[ToolSummary]
    troubleshooting_templates: list[TroubleshootingTemplateSummary]