from sqlalchemy import Column, ForeignKey, Integer
from app.core.database import Base


class RelationQueuesTools(Base):
    __tablename__ = "relation_queues_tools"

    queue_id = Column(
        Integer,
        ForeignKey("queues.id"),
        primary_key=True
    )

    tool_id = Column(
        Integer,
        ForeignKey("tools.id"),
        primary_key=True
    )