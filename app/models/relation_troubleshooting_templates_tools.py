from sqlalchemy import Column, ForeignKey, Integer
from app.core.database import Base

class RelationTroubleshootingTemplatesTools(Base):
    __tablename__ = "relation_troubleshooting_templates_tools"

    troubleshooting_template_id = Column(
        Integer,
        ForeignKey("troubleshooting_templates.id"),
        primary_key=True
    )

    tool_id = Column(
        Integer,
        ForeignKey("tools.id"),
        primary_key=True
    )