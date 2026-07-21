from sqlalchemy import Column, ForeignKey, Integer
from app.core.database import Base

class RelationKnowledgeBaseTools(Base):
    __tablename__ = "relation_knowledge_base_tools"

    knowledge_base_id = Column(
        Integer,
        ForeignKey("knowledge_base.id"),
        primary_key=True
    )

    tool_id = Column(
        Integer,
        ForeignKey("tools.id"),
        primary_key=True
    )