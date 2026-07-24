from sqlalchemy import Boolean, Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class WHSSystems(Base):
    __tablename__ = 'whs_systems'

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    description = Column(String)
    created_by = Column(Integer, ForeignKey('users.id'), nullable=False)

    locations = relationship(
        "Locations",
        back_populates="whs_system"
    )