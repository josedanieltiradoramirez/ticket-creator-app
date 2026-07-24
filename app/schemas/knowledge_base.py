from pydantic import BaseModel
from typing import Optional
from datetime import datetime

from app.schemas.tools import ToolResponse
from app.schemas.troubleshooting_templates import TroubleshootingTemplateResponse

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
    tools: list[ToolResponse]
    troubleshooting_templates: list[TroubleshootingTemplateResponse]