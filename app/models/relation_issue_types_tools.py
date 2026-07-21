from sqlalchemy import Column, ForeignKey, Integer
from app.core.database import Base

class RelationIssueTypesTools(Base):
    __tablename__ = "relation_issue_types_tools"

    issue_type_id = Column(
        Integer,
        ForeignKey("issue_types.id"),
        primary_key=True
    )

    tool_id = Column(
        Integer,
        ForeignKey("tools.id"),
        primary_key=True
    )