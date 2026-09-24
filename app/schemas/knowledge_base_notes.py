from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict

from app.schemas.summaries import (
    IssueTypeSummary,
    ToolSummary
)


class KnowledgeBaseNoteCreate(BaseModel):
    title: str
    content: str
    category: Optional[str] = None
    is_pinned: bool = False
    is_active: bool = True


class KnowledgeBaseNoteUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    category: Optional[str] = None
    is_pinned: Optional[bool] = None
    is_active: Optional[bool] = None


class KnowledgeBaseNoteResponse(BaseModel):
    id: int  
    title: str
    content: str
    category: Optional[str] = None
    is_pinned: bool
    is_active: bool
    created_by: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class KnowledgeBaseNoteDetailResponse(KnowledgeBaseNoteResponse):
    tools: list[ToolSummary] = []
    issue_types: list[IssueTypeSummary] = []