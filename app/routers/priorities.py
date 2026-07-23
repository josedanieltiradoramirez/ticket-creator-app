from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Annotated

from app.core.database import get_db
from app.models.priorities import Priorities
from app.models.users import Users
from app.routers.auth import get_current_user

from app.schemas.priorities import PriorityCreate, PriorityUpdate, PriorityResponse



router = APIRouter(
    prefix='/priorities',
    tags=['priorities']) 


db_dependency = Annotated[Session, Depends(get_db)]
user_dependency = Annotated[Users, Depends(get_current_user)]
    
@router.get("/", response_model=List[PriorityResponse])
async def get_all_priorities(user : user_dependency, db: db_dependency):
    priorities = db.query(Priorities).filter(Priorities.created_by == user.id).all()
    return priorities

@router.get("/{id}", response_model=PriorityResponse)
async def get_priority_by_id(user : user_dependency, id: int, db: db_dependency):
    priority = db.query(Priorities).filter(Priorities.id == id, Priorities.created_by == user.id).first()
    if not priority:
        raise HTTPException(status_code=404, detail="Priority not found")
    return priority

@router.post("/", response_model=PriorityResponse, status_code=201)
async def create_priority(user : user_dependency, priority: PriorityCreate, db: db_dependency):
    priority_data = priority.model_dump()
    new_priority = Priorities(**priority_data, created_by=user.id)
    db.add(new_priority)
    db.commit()
    db.refresh(new_priority)
    return new_priority



@router.put("/{id}", response_model=PriorityResponse)
async def edit_priority(user: user_dependency, id: int, priority: PriorityUpdate, db: db_dependency):
    existing_priority = db.query(Priorities).filter(Priorities.id == id, Priorities.created_by == user.id).first()
    if not existing_priority:
        raise HTTPException(status_code=404, detail="Priority not found")
    priority_data = priority.model_dump()
    for key, value in priority_data.items():
        setattr(existing_priority, key, value)
    
    db.commit()
    db.refresh(existing_priority)
    return existing_priority

@router.delete("/{id}")
async def delete_priority(user: user_dependency, id: int, db: db_dependency):
    priority = db.query(Priorities).filter(Priorities.id == id, Priorities.created_by == user.id).first()
    if not priority:
        raise HTTPException(status_code=404, detail="Priority not found")
    db.delete(priority)
    db.commit()
    
    return {
        "message": "Priority deleted successfully"
    }
    