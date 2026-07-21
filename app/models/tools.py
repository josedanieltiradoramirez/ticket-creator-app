from sqlalchemy import Boolean, Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class Tools(Base):
    __tablename__ = 'tools'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)

    ## Relationships
    issue_types = relationship("IssueTypes", secondary="relation_issue_types_tools", back_populates="tools")
    knowledge_base = relationship("KnowledgeBase", secondary="relation_knowledge_base_tools", back_populates="tools")
    troubleshooting_templates = relationship("TroubleshootingTemplates", secondary="relation_troubleshooting_templates_tools", back_populates="tools")