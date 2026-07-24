from pydantic import BaseModel
from typing import Optional
from datetime import datetime

from app.schemas.issue_types import IssueTypeResponse
from app.schemas.troubleshooting_templates import TroubleshootingTemplateResponse
from app.schemas.knowledge_base import KnowledgeBaseItemResponse

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
    issue_types: list[IssueTypeResponse]
    troubleshooting_templates: list[TroubleshootingTemplateResponse]
    knowledge_base: list[KnowledgeBaseItemResponse]