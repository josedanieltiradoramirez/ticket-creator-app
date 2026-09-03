from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Annotated

from app.core.database import get_db
from app.models.issue_types import IssueTypes
from app.models.troubleshooting_templates import TroubleshootingTemplates
from app.models.tools import Tools
from app.models.tickets import Tickets
from app.models.knowledge_base import KnowledgeBase
from app.models.users import Users
from app.routers.auth import get_current_user

from app.schemas.knowledge_base import KnowledgeBaseItemCreate, KnowledgeBaseItemUpdate, KnowledgeBaseItemResponse, KnowledgeBaseDetailResponse

from sqlalchemy.orm import selectinload

router = APIRouter(
    prefix='/knowledge_base',
    tags=['knowledge_base']) 


db_dependency = Annotated[Session, Depends(get_db)]
user_dependency = Annotated[Users, Depends(get_current_user)]
    
@router.get("/", response_model=List[KnowledgeBaseItemResponse])
async def get_all_knowledge_base_items(user : user_dependency, db: db_dependency):
    knowledge_base_items = db.query(KnowledgeBase).filter(KnowledgeBase.created_by == user.id).all()
    return knowledge_base_items

@router.get("/{id}", response_model=KnowledgeBaseDetailResponse)
async def get_knowledge_base_item_by_id(user : user_dependency, id: int, db: db_dependency):
    knowledge_base_item = (
            db.query(KnowledgeBase)
            .options(
                selectinload(KnowledgeBase.issue_types),
                selectinload(KnowledgeBase.tools),
                selectinload(KnowledgeBase.troubleshooting_templates),
                selectinload(KnowledgeBase.tickets),
            )
            .filter(
                KnowledgeBase.id == id,
                KnowledgeBase.created_by == user.id
            )
            .first()
        )
    if not knowledge_base_item:
        raise HTTPException(status_code=404, detail="Knowledge base item not found")
    return knowledge_base_item

@router.post("/", response_model=KnowledgeBaseItemResponse, status_code=201)
async def create_knowledge_base_item(user : user_dependency, knowledge_base_item: KnowledgeBaseItemCreate, db: db_dependency):
    knowledge_base_data = knowledge_base_item.model_dump()
    new_knowledge_base_item = KnowledgeBase(**knowledge_base_data, created_by=user.id)
    db.add(new_knowledge_base_item)
    db.commit()
    db.refresh(new_knowledge_base_item)
    return new_knowledge_base_item



@router.put("/{id}", response_model=KnowledgeBaseItemResponse)
async def edit_knowledge_base_item(user: user_dependency, id: int, knowledge_base_item: KnowledgeBaseItemUpdate, db: db_dependency):
    existing_knowledge_base_item = db.query(KnowledgeBase).filter(KnowledgeBase.id == id, KnowledgeBase.created_by == user.id).first()
    if not existing_knowledge_base_item:
        raise HTTPException(status_code=404, detail="Knowledge base item not found")
    existing_knowledge_base_item.article_number = knowledge_base_item.article_number
    existing_knowledge_base_item.title = knowledge_base_item.title
    existing_knowledge_base_item.url = knowledge_base_item.url
    existing_knowledge_base_item.description = knowledge_base_item.description

    if knowledge_base_item.issue_types is not None:
        issue_types = (
                db.query(IssueTypes)
                .filter(
                    IssueTypes.id.in_(knowledge_base_item.issue_types),
                    IssueTypes.created_by == user.id
                )
                .all()
            )
        existing_knowledge_base_item.issue_types = issue_types

    if knowledge_base_item.troubleshooting_templates is not None:
        troubleshooting_templates = (
            db.query(TroubleshootingTemplates)
            .filter(
                TroubleshootingTemplates.id.in_(knowledge_base_item.troubleshooting_templates),
                TroubleshootingTemplates.created_by == user.id
            )
            .all()
        )
        existing_knowledge_base_item.troubleshooting_templates = troubleshooting_templates

    if knowledge_base_item.tools is not None:
        tools = (
            db.query(Tools)
            .filter(
                Tools.id.in_(knowledge_base_item.tools),
                Tools.created_by == user.id
            )
            .all()
        )
        existing_knowledge_base_item.tools = tools

    if knowledge_base_item.tickets is not None:
        tickets = (
            db.query(Tickets)
            .filter(
                Tickets.id.in_(knowledge_base_item.tickets),
                Tickets.created_by == user.id
            )
            .all()
        )
        existing_knowledge_base_item.tickets = tickets

    db.commit()
    db.refresh(existing_knowledge_base_item)
    return existing_knowledge_base_item

@router.delete("/{id}")
async def delete_knowledge_base_item(user: user_dependency, id: int, db: db_dependency):
    knowledge_base_item = db.query(KnowledgeBase).filter(KnowledgeBase.id == id, KnowledgeBase.created_by == user.id).first()
    if not knowledge_base_item:
        raise HTTPException(status_code=404, detail="Knowledge base item not found")
    db.delete(knowledge_base_item)
    db.commit()
    
    return {
        "message": "Knowledge base item deleted successfully"
    }
    