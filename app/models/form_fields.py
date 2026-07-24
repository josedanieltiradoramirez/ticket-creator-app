from sqlalchemy import Boolean, Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class FormFields(Base):
    __tablename__ = 'form_fields'

    id = Column(Integer, primary_key=True, index=True)
    form_id = Column(ForeignKey('forms.id'), nullable=False)
    label = Column(String, nullable=False)
    field_type = Column(String, nullable=False)
    required = Column(Boolean, default=False)
    display_order = Column(Integer, nullable=False)
    created_by = Column(Integer, ForeignKey('users.id'), nullable=False)