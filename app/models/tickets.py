from sqlalchemy import Column, DateTime, Integer, String, ForeignKey, func, Boolean
from sqlalchemy.orm import relationship
from app.core.database import Base

class Tickets(Base):
    __tablename__ = 'tickets'

    ## Ticket basic information
    id = Column(Integer, primary_key=True, index=True)
    ticket_number = Column(String, nullable=False)
    title = Column(String, nullable=False)
    tool_id = Column(Integer, ForeignKey("tools.id"), nullable=False)
    user_name = Column(String, nullable=True)
    user_type = Column(String, nullable=True)
    user_best_contact_number = Column(String, nullable=True)
    user_email = Column(String, nullable=True)
    issue_description = Column(String, nullable=False)
    short_issue = Column(String, nullable=False)
    troubleshooting_steps = Column(String, nullable=False)
    location_id = Column(Integer, ForeignKey('locations.id'), nullable=False)
    priority_id = Column(Integer, ForeignKey('priorities.id'), nullable=False)
    
    ## Ticket generation
    generated_ticket = Column(String, nullable=False)
    generated_time_entry = Column(String, nullable=False)
    is_routed = Column(Boolean, default=False)
    is_status = Column(Boolean, default=False)
    generated_status_time_entry = Column(String, nullable=False)
    issue_type_id = Column(Integer, ForeignKey('issue_types.id'), nullable=False)
    kb_article_id = Column(Integer, ForeignKey('knowledge_base.id'), nullable=True)
    
    ## Templates
    form_template_id = Column(Integer, ForeignKey('forms.id'), nullable=False)
    troubleshooting_template_id = Column(Integer, ForeignKey('troubleshooting_templates.id'), nullable=False)

    ## Ticket tracking
    status_id = Column(Integer, ForeignKey('ticket_status.id'), nullable=False)
    queue_id = Column(Integer, ForeignKey("queues.id"), nullable=False)
    created_at = Column(DateTime(timezone=True),server_default=func.now())
    created_by = Column(Integer, ForeignKey('users.id'), nullable=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(),onupdate=func.now())
