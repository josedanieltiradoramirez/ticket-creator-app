from sqlalchemy import Boolean, Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class Forms(Base):
    __tablename__ = 'forms'

    id = Column(Integer, primary_key=True, index=True) 
    name = Column(String, nullable=False)
    description = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    created_by = Column(Integer, ForeignKey('users.id'), nullable=False)

    ## Relationships
    issue_types = relationship(
        "IssueTypes",
        back_populates="form"
    )

    form_fields = relationship(
        "FormFields",
        back_populates="form",
        cascade="all, delete-orphan",
        order_by="FormFields.display_order"
    )

    tickets = relationship(
        "Tickets",
        back_populates="form_template"
    )