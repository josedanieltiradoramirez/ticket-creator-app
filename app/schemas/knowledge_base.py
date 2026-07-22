from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class KnowledgeBaseItemCreate(BaseModel):
    article_number: str
    title: str
    url: str
    description: str

class KnowledgeBaseItemUpdate(BaseModel):
    article_number: str
    title: str
    url: str
    description: str

class KnowledgeBaseItemResponse(BaseModel):
    id: int
    article_number: str
    title: str
    url: str
    description: str

    class Config:
        orm_mode = True