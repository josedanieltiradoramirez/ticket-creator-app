from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Annotated

from app.core.database import get_db
from app.models.queues import Queues
from app.models.ticket_status import TicketStatus
from app.models.users import Users
from app.routers.auth import get_current_user

from app.schemas.queues import QueueCreate, QueueUpdate, QueueResponse



router = APIRouter(
    prefix='/queues',
    tags=['queues']) 


db_dependency = Annotated[Session, Depends(get_db)]
user_dependency = Annotated[Users, Depends(get_current_user)]
    
@router.get("/", response_model=List[QueueResponse])
async def get_all_queues(user : user_dependency, db: db_dependency):
    queues = db.query(Queues).filter(Queues.created_by == user.id).all()
    return queues

@router.get("/{id}", response_model=QueueResponse)
async def get_queue_by_id(user : user_dependency, id: int, db: db_dependency):
    queue = db.query(Queues).filter(Queues.id == id, Queues.created_by == user.id).first()
    if not queue:
        raise HTTPException(status_code=404, detail="Queue not found")
    return queue

@router.post("/", response_model=QueueResponse, status_code=201)
async def create_queue(user : user_dependency, queue: QueueCreate, db: db_dependency):
    queue_data = queue.model_dump()
    new_queue = Queues(**queue_data, created_by=user.id)
    db.add(new_queue)
    db.commit()
    db.refresh(new_queue)
    return new_queue



@router.put("/{id}", response_model=QueueResponse)
async def edit_queue(user: user_dependency, id: int, queue: QueueUpdate, db: db_dependency):
    existing_queue = db.query(Queues).filter(Queues.id == id, Queues.created_by == user.id).first()
    if not existing_queue:
        raise HTTPException(status_code=404, detail="Queue not found")
    queue_data = queue.model_dump()
    for key, value in queue_data.items():
        setattr(existing_queue, key, value)
    
    db.commit()
    db.refresh(existing_queue)
    return existing_queue

@router.delete("/{id}")
async def delete_queue(user: user_dependency, id: int, db: db_dependency):
    queue = db.query(Queues).filter(Queues.id == id, Queues.created_by == user.id).first()
    if not queue:
        raise HTTPException(status_code=404, detail="Queue not found")
    db.delete(queue)
    db.commit()
    
    return {
        "message": "Queue deleted successfully"
    }
    