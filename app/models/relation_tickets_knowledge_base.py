from sqlalchemy import Column, ForeignKey, Integer
from app.core.database import Base

class RelationTicketsKnowledgeBase(Base):
    __tablename__ = "relation_tickets_knowledge_base"

    ticket_id = Column(
        Integer,
        ForeignKey("tickets.id"),
        primary_key=True
    )

    knowledge_base_id = Column(
        Integer,
        ForeignKey("knowledge_base.id"),
        primary_key=True
    )