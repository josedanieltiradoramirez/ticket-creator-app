from sqlalchemy import Column, ForeignKey, Integer
from app.core.database import Base


class RelationQueuesIssueTypes(Base):
    __tablename__ = "relation_queues_issue_types"

    queue_id = Column(
        Integer,
        ForeignKey("queues.id"),
        primary_key=True
    )

    issue_type_id = Column(
        Integer,
        ForeignKey("issue_types.id"),
        primary_key=True
    )