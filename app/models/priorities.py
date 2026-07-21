from sqlalchemy import Boolean, Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class Priorities(Base):
    __tablename__ = 'priorities'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)