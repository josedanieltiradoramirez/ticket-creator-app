from sqlalchemy import Boolean, Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class Locations(Base):
    __tablename__ = 'locations'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    city = Column(String, nullable=False)
    state = Column(String, nullable=False)
    code = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    created_by = Column(Integer, ForeignKey('users.id'), nullable=False)
    warehouse_management_system_id = Column(Integer, ForeignKey('warehouse_management_systems.id'), nullable=True)

    ## Relationships
    warehouse_management_system = relationship(
        "WarehouseManagementSystems",
        back_populates="locations"
    )

