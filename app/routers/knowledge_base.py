from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Annotated

from app.core.database import get_db
from app.models.knowledge_base import KnowledgeBase
from app.models.users import Users
from app.routers.auth import get_current_user

from app.schemas.tickets import TicketCreate, TicketUpdate, TicketResponse



router = APIRouter(
    prefix='/knowledge_base',
    tags=['knowledge_base']) 


db_dependency = Annotated[Session, Depends(get_db)]
user_dependency = Annotated[Users, Depends(get_current_user)]
    
@router.get("/", response_model=List[TicketResponse])
async def get_all_knowledge_base_items(user : user_dependency, db: db_dependency):
    knowledge_base_items = db.query(KnowledgeBase).filter(KnowledgeBase.created_by == user.id).all()
    return knowledge_base_items

@router.get("/{id}", response_model=TicketResponse)
async def get_knowledge_base_item_by_id(user : user_dependency, id: int, db: db_dependency):
    knowledge_base_item = db.query(KnowledgeBase).filter(KnowledgeBase.id == id, KnowledgeBase.created_by == user.id).first()
    if not knowledge_base_item:
        raise HTTPException(status_code=404, detail="Knowledge base item not found")
    return knowledge_base_item

@router.post("/", response_model=TicketResponse, status_code=201)
async def create_knowledge_base_item(user : user_dependency, knowledge_base_item: TicketCreate, db: db_dependency):
    knowledge_base_data = knowledge_base_item.model_dump()
    new_knowledge_base_item = KnowledgeBase(**knowledge_base_data, created_by=user.id)
    db.add(new_knowledge_base_item)
    db.commit()
    db.refresh(new_knowledge_base_item)
    return new_knowledge_base_item



@router.put("/{id}", response_model=TicketResponse)
async def edit_knowledge_base_item(user: user_dependency, id: int, knowledge_base_item: TicketUpdate, db: db_dependency):
    existing_knowledge_base_item = db.query(KnowledgeBase).filter(KnowledgeBase.id == id, KnowledgeBase.created_by == user.id).first()
    if not existing_knowledge_base_item:
        raise HTTPException(status_code=404, detail="Knowledge base item not found")
    knowledge_base_data = knowledge_base_item.model_dump()
    for key, value in knowledge_base_data.items():
        setattr(existing_knowledge_base_item, key, value)
    
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
    