from sqlalchemy import Column, ForeignKey, Integer

from app.core.database import Base


class RelationToolsKnowledgeBaseNotes(Base):
    __tablename__ = "relation_tools_knowledge_base_notes"

    tool_id = Column(
        Integer,
        ForeignKey("tools.id"),
        primary_key=True
    )

    knowledge_base_note_id = Column(
        Integer,
        ForeignKey("knowledge_base_notes.id"),
        primary_key=True
    )