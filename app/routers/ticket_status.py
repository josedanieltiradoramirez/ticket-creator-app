from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Annotated

from app.core.database import get_db
from app.models.priorities import Priorities
from app.models.ticket_status import TicketStatus
from app.models.users import Users
from app.routers.auth import get_current_user

from app.schemas.ticket_status import TicketStatusCreate, TicketStatusUpdate, TicketStatusResponse



router = APIRouter(
    prefix='/ticket_status',
    tags=['ticket_status']) 


db_dependency = Annotated[Session, Depends(get_db)]
user_dependency = Annotated[Users, Depends(get_current_user)]
    
@router.get("/", response_model=List[TicketStatusResponse])
async def get_all_ticket_status(user : user_dependency, db: db_dependency):
    ticket_status = db.query(TicketStatus).filter(TicketStatus.created_by == user.id).all()
    return ticket_status

@router.get("/{id}", response_model=TicketStatusResponse)
async def get_ticket_status_by_id(user : user_dependency, id: int, db: db_dependency):
    ticket_status = db.query(TicketStatus).filter(TicketStatus.id == id, TicketStatus.created_by == user.id).first()
    if not ticket_status:
        raise HTTPException(status_code=404, detail="Ticket status not found")
    return ticket_status

@router.post("/", response_model=TicketStatusResponse, status_code=201)
async def create_ticket_status(user : user_dependency, ticket_status: TicketStatusCreate, db: db_dependency):
    ticket_status_data = ticket_status.model_dump()
    new_ticket_status = TicketStatus(**ticket_status_data, created_by=user.id)
    db.add(new_ticket_status)
    db.commit()
    db.refresh(new_ticket_status)
    return new_ticket_status



@router.put("/{id}", response_model=TicketStatusResponse)
async def edit_ticket_status(user: user_dependency, id: int, ticket_status: TicketStatusUpdate, db: db_dependency):
    existing_ticket_status = db.query(TicketStatus).filter(TicketStatus.id == id, TicketStatus.created_by == user.id).first()
    if not existing_ticket_status:
        raise HTTPException(status_code=404, detail="Ticket status not found")
    ticket_status_data = ticket_status.model_dump()
    for key, value in ticket_status_data.items():
        setattr(existing_ticket_status, key, value)
    
    db.commit()
    db.refresh(existing_ticket_status)
    return existing_ticket_status

@router.delete("/{id}")
async def delete_ticket_status(user: user_dependency, id: int, db: db_dependency):
    ticket_status = db.query(TicketStatus).filter(TicketStatus.id == id, TicketStatus.created_by == user.id).first()
    if not ticket_status:
        raise HTTPException(status_code=404, detail="Ticket status not found")
    db.delete(ticket_status)
    db.commit()
    
    return {
        "message": "Ticket status deleted successfully"
    }
    