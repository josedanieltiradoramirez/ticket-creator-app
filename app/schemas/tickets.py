from pydantic import BaseModel
from typing import Optional
from datetime import datetime



class TicketCreate(BaseModel):
    ticket_number: str
    title: str
    tool_id: int
    user_name: str
    user_type: str
    user_best_contact_number: str
    user_email: str
    issue_description: str
    short_issue: str
    troubleshooting_steps: str
    location_id: int
    priority_id: int
    is_routed: bool
    is_status: bool
    issue_type_id: int
    kb_article_id: int

    form_template_id: int
    troubleshooting_template_id: int
    status_id: int
    queue_id: int

    class Config:
        orm_mode = True


class TicketUpdate(BaseModel):
    title: str
    tool_id: int
    user_name: str
    user_type: str
    user_best_contact_number: str
    user_email: str
    issue_description: str
    short_issue: str
    troubleshooting_steps: str
    location_id: int
    priority_id: int
    is_routed: bool
    is_status: bool
    issue_type_id: int
    kb_article_id: int

    form_template_id: int
    troubleshooting_template_id: int
    status_id: int
    queue_id: int

    class Config:
        orm_mode = True

class TicketResponse(BaseModel):
    id: int
    ticket_number: str
    title: str
    tool_id: int
    user_name: str
    user_type: str
    user_best_contact_number: str
    user_email: str
    issue_description: str
    short_issue: str
    troubleshooting_steps: str
    location_id: int
    priority_id: int
    is_routed: bool
    is_status: bool
    issue_type_id: int
    kb_article_id: int

    form_template_id: int
    troubleshooting_template_id: int
    status_id: int
    queue_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True