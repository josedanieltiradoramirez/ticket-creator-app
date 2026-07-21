from sqlalchemy import Boolean, Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class TroubleshootingTemplates(Base):
    __tablename__ = 'troubleshooting_templates'

    id = Column(Integer, primary_key=True, index=True)
    issue_type_id = Column(ForeignKey('issue_types.id'), nullable=False)
    form_id = Column(ForeignKey('forms.id'), nullable=False)
    steps = Column(String, nullable=False)
    generated_description = Column(String, nullable=False)
    kb_article_id = Column(ForeignKey('kb_articles.id'), nullable=True)
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