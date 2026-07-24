from pydantic import BaseModel
from typing import Optional
from datetime import datetime

from app.schemas.tools import ToolResponse
from app.schemas.knowledge_base import KnowledgeBaseItemResponse

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

    class Config:
        orm_mode = True

class TroubleshootingTemplateDetailResponse(TroubleshootingTemplateResponse):
    tools: list[ToolResponse]
    knowledge_base: list[KnowledgeBaseItemResponse]