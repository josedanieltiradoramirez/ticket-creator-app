from sqlalchemy import Boolean, Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class IssueTypes(Base):
    __tablename__ = 'issue_types'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String, nullable=False)
    form_template_id = Column(Integer, ForeignKey('forms.id'), nullable=True)
    category = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    display_name = Column(String, nullable=True)
    search_keywords = Column(String, nullable=True)
    created_by = Column(Integer, ForeignKey('users.id'), nullable=False)

    ## Relationships
    troubleshooting_templates = relationship("TroubleshootingTemplates", secondary="relation_issue_types_troubleshooting_templates", back_populates ="issue_types")
    tools = relationship("Tools", secondary="relation_issue_types_tools", back_populates="issue_types")
    

    