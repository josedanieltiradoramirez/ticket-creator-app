from sqlalchemy import Column, DateTime, Integer, String, ForeignKey, func, Boolean, Text
from sqlalchemy.orm import relationship
from app.core.database import Base


class Tickets(Base):
    __tablename__ = "tickets"

    ## Ticket basic information
    id = Column(Integer, primary_key=True, index=True)
    ticket_number = Column(String, nullable=True)
    title = Column(String, nullable=True)

    tool_id = Column(Integer, ForeignKey("tools.id"), nullable=True)

    user_name = Column(String, nullable=True)
    user_type = Column(String, nullable=True)
    user_best_contact_number = Column(String, nullable=True)
    user_email = Column(String, nullable=True)

    issue_description = Column(Text, nullable=True)
    short_issue = Column(String, nullable=True)
    troubleshooting_steps = Column(Text, nullable=True)

    location_id = Column(Integer, ForeignKey("locations.id"), nullable=True)
    priority_id = Column(Integer, ForeignKey("priorities.id"), nullable=True)

    ## Ticket generation
    generated_ticket = Column(Text, nullable=True)
    generated_time_entry = Column(Text, nullable=True)

    is_routed = Column(Boolean, default=False, nullable=False)
    is_status = Column(Boolean, default=False, nullable=False)

    generated_status_time_entry = Column(Text, nullable=True)

    issue_type_id = Column(Integer, ForeignKey("issue_types.id"), nullable=True)

    ticket_body = Column(Text, nullable=True)
    additional_notes = Column(Text, nullable=True)
    form_content = Column(Text, nullable=True)

    ## Templates
    form_template_id = Column(Integer, ForeignKey("forms.id"), nullable=True)
    troubleshooting_template_id = Column(
        Integer,
        ForeignKey("troubleshooting_templates.id"),
        nullable=True,
    )

    ## Ticket tracking
    status_id = Column(Integer, ForeignKey("ticket_status.id"), nullable=True)
    queue_id = Column(Integer, ForeignKey("queues.id"), nullable=True)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    closed_at = Column(DateTime(timezone=True), nullable=True)

    ## Relationships
    tool = relationship(
        "Tools",
        back_populates="tickets"
    )

    location = relationship(
        "Locations",
        back_populates="tickets"
    )

    priority = relationship(
        "Priorities",
        back_populates="tickets"
    )

    issue_type = relationship(
        "IssueTypes",
        back_populates="tickets"
    )

    knowledge_base = relationship(
        "KnowledgeBase", secondary="relation_tickets_knowledge_base",
        back_populates="tickets"
    )

    form_template = relationship(
        "Forms",
        back_populates="tickets"
    )

    troubleshooting_template = relationship(
        "TroubleshootingTemplates",
        back_populates="tickets"
    )

    status = relationship(
        "TicketStatus",
        back_populates="tickets"
    )

    queue = relationship(
        "Queues",
        back_populates="tickets"
    )

    creator = relationship(
        "Users",
        back_populates="tickets"
    )
