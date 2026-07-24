from sqlalchemy import Column, ForeignKey, Integer
from app.core.database import Base

class RelationIssueTypesKnowledgeBase(Base):
    __tablename__ = "relation_issue_types_knowledge_base"

    issue_type_id = Column(
        Integer,
        ForeignKey("issue_types.id"),
        primary_key=True
    )

    knowledge_base_id = Column(
        Integer,
        ForeignKey("knowledge_base.id"),
        primary_key=True
    )