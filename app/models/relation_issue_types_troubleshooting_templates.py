from sqlalchemy import Column, ForeignKey, Integer
from app.core.database import Base

class RelationIssueTypesTroubleshootingTemplates(Base):
    __tablename__ = "relation_issue_types_troubleshooting_templates"

    issue_type_id = Column(
        Integer,
        ForeignKey("issue_types.id"),
        primary_key=True
    )

    troubleshooting_template_id = Column(
        Integer,
        ForeignKey("troubleshooting_templates.id"),
        primary_key=True
    )