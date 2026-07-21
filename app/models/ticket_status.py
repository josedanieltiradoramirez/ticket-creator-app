from sqlalchemy import Boolean, Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class TicketStatus(Base):
    __tablename__ = 'ticket_status'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)