from sqlalchemy import Column, ForeignKey, Integer

from app.core.database import Base


class RelationIssueTypesKnowledgeBaseNotes(Base):
    __tablename__ = "relation_issue_types_knowledge_base_notes"

    issue_type_id = Column(
        Integer,
        ForeignKey("issue_types.id"),
        primary_key=True
    )

    knowledge_base_note_id = Column(
        Integer,
        ForeignKey("knowledge_base_notes.id"),
        primary_key=True
    )