from sqlalchemy import Column, ForeignKey, Integer
from app.core.database import Base

class RelationTroubleshootingTemplatesKnowledgeBase(Base):
    __tablename__ = "relation_troubleshooting_templates_knowledge_base"

    troubleshooting_template_id = Column(
        Integer,
        ForeignKey("troubleshooting_templates.id"),
        primary_key=True
    )

    knowledge_base_id = Column(
        Integer,
        ForeignKey("knowledge_base.id"),
        primary_key=True
    )