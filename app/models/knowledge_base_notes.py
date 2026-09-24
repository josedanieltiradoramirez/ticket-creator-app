from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.core.database import Base


class KnowledgeBaseNotes(Base):
    __tablename__ = "knowledge_base_notes"

    id = Column(Integer, primary_key=True, index=True)

    title = Column(String, nullable=False)

    content = Column(String, nullable=False)

    category = Column(String, nullable=True)

    is_pinned = Column(Boolean, default=False)

    is_active = Column(Boolean, default=True)

    created_by = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False
    )

    tools = relationship(
        "Tools",
        secondary="relation_tools_knowledge_base_notes",
        back_populates="knowledge_base_notes"
    )

    issue_types = relationship(
        "IssueTypes",
        secondary="relation_issue_types_knowledge_base_notes",
        back_populates="knowledge_base_notes"
    )