from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

from app.schemas.forms import FormDetailResponse
from app.schemas.summaries import FormSummary, IssueTypeSummary, KnowledgeBaseSummary, LocationSummary, PrioritySummary, QueueSummary, TicketFormSummary, TicketStatusSummary, ToolSummary, TroubleshootingTemplateSummary



class TicketBase(BaseModel):
    ticket_number: Optional[str] = None
    title: Optional[str] = None
    tool_id: Optional[int] = None
    user_name: Optional[str] = None
    user_type: Optional[str] = None
    user_best_contact_number: Optional[str] = None
    user_email: Optional[str] = None
    issue_description: Optional[str] = None
    short_issue: Optional[str] = None
    troubleshooting_steps: Optional[str] = None
    location_id: Optional[int] = None
    priority_id: Optional[int] = None

    generated_ticket: Optional[str] = None
    generated_time_entry: Optional[str] = None
    generated_status_time_entry: Optional[str] = None

    is_routed: bool = False
    is_status: bool = False

    issue_type_id: Optional[int] = None
    kb_article_id: Optional[int] = None

    ticket_body: Optional[str] = None
    additional_notes: Optional[str] = None
    form_content: Optional[str] = None

    form_template_id: Optional[int] = None
    troubleshooting_template_id: Optional[int] = None

    status_id: Optional[int] = None
    queue_id: Optional[int] = None

    model_config = ConfigDict(from_attributes=True)

class TicketCreate(TicketBase):
    pass

class TicketUpdate(TicketBase):
    pass
    
class TicketResponse(TicketBase):
    id: int
    created_at: datetime
    updated_at: datetime
    closed_at: Optional[datetime] = None

class TicketDetailResponse(TicketResponse):
    tool: Optional[ToolSummary] = None
    issue_type: Optional[IssueTypeSummary] = None
    knowledge_base: list[KnowledgeBaseSummary] = []
    troubleshooting_template: Optional[TroubleshootingTemplateSummary] = None
    form_template: Optional[TicketFormSummary] = None
    queue: Optional[QueueSummary] = None
    status: Optional[TicketStatusSummary] = None
    location: Optional[LocationSummary] = None
    priority: Optional[PrioritySummary] = None

class TicketSummaryResponse(TicketResponse):
    tool: Optional[ToolSummary] = None
    issue_type: Optional[IssueTypeSummary] = None
    queue: Optional[QueueSummary] = None
    status: Optional[TicketStatusSummary] = None
    location: Optional[LocationSummary] = None
    priority: Optional[PrioritySummary] = None

class TicketListResponse(BaseModel):
    items: list[TicketSummaryResponse]
    total: int
    page: int
    limit: int
    pages: int


