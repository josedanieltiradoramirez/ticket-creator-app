from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class Tickets(Base):
    __tablename__ = 'tickets'

    id = Column(Integer, primary_key=True, index=True)
    ticket_number = Column(String, unique=True, index=True)
    title = Column(String, nullable=False)
    location = Column(String, nullable=True)
    user_name = Column(String, nullable=True)
    user_type = Column(String, nullable=True)
    user_best_contact_number = Column(String, nullable=True)
    user_email = Column(String, nullable=True)
    issue_description = Column(String, nullable=False)
    issue = Column(String, nullable=False)
    troubleshooting_steps = Column(String, nullable=False)
    content = Column(String, nullable=False)
    kb = Column(Integer, nullable=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    date = Column(String, nullable=True)
    
