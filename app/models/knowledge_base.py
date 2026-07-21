from sqlalchemy import Boolean, Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class KnowledgeBase(Base):
    __tablename__ = 'knowledge_base'

    id = Column(Integer, primary_key=True, index=True)
    article_number = Column(String, nullable=False)
    title = Column(String, nullable=False)
    url = Column(String, nullable=False)
    description = Column(String, nullable=False)


    ## Relationships
    tools = relationship("Tools", secondary="relation_knowledge_base_tools", back_populates="knowledge_base")
    troubleshooting_templates = relationship("TroubleshootingTemplates", secondary="relation_troubleshooting_templates_knowledge_base", back_populates="knowledge_base")
