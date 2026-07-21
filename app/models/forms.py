from sqlalchemy import Boolean, Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class Forms(Base):
    __tablename__ = 'forms'

    id = Column(Integer, primary_key=True, index=True)
    issue_type_id = Column(ForeignKey('issue_types.id'), nullable=False)
    name = Column(String, nullable=False)
    description = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)