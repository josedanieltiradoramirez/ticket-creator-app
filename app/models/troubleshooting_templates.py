from sqlalchemy import Boolean, Column, Integer, String, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base

class TroubleshootingTemplates(Base):
    __tablename__ = 'troubleshooting_templates'

    id = Column(Integer, primary_key=True, index=True)
    steps = Column(Text, nullable=False)
    generated_description = Column(Text, nullable=False)
    is_active = Column(Boolean, default=True)

    ## Relationships
    issue_types = relationship(
        "IssueTypes",
        secondary="relation_issue_types_troubleshooting_templates",
        back_populates="troubleshooting_templates"
    )
    knowledge_base = relationship(
        "KnowledgeBase",
        secondary="relation_troubleshooting_templates_knowledge_base",
        back_populates="troubleshooting_templates"
    )
    tools = relationship(
        "Tools",
        secondary="relation_troubleshooting_templates_tools",
        back_populates="troubleshooting_templates"
    )