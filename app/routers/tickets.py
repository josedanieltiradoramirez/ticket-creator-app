from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Annotated

from app.core.database import get_db
from app.models.tickets import Tickets
from app.models.users import Users
from app.routers.auth import get_current_user

from app.schemas.tickets import TicketCreate, TicketUpdate, TicketResponse



router = APIRouter(
    prefix='/tickets',
    tags=['tickets']) 


db_dependency = Annotated[Session, Depends(get_db)]
user_dependency = Annotated[Users, Depends(get_current_user)]
    
@router.get("/", response_model=List[TicketResponse])
async def get_all_tickets(user : user_dependency, db: db_dependency):
    tickets = db.query(Tickets).filter(Tickets.created_by == user.id).all()
    return tickets

@router.get("/{id}", response_model=TicketResponse)
async def get_ticket_by_id(user : user_dependency, id: int, db: db_dependency):
    ticket = db.query(Tickets).filter(Tickets.id == id, Tickets.created_by == user.id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return ticket

@router.post("/", response_model=TicketResponse, status_code=201)
async def create_ticket(user : user_dependency, ticket: TicketCreate, db: db_dependency):
    ticket_data = ticket.model_dump()
    new_ticket = Tickets(**ticket_data, created_by=user.id)
    db.add(new_ticket)
    db.commit()
    db.refresh(new_ticket)
    return new_ticket
        


@router.put("/{id}", response_model=TicketResponse)
async def edit_ticket(user: user_dependency, id: int, ticket: TicketUpdate, db: db_dependency):
    existing_ticket = db.query(Tickets).filter(Tickets.id == id, Tickets.created_by == user.id).first()
    if not existing_ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    ticket_data = ticket.model_dump()
    for key, value in ticket_data.items():
        setattr(existing_ticket, key, value)
    
    db.commit()
    db.refresh(existing_ticket)
    return existing_ticket
    


@router.delete("/{id}")
async def delete_ticket(user: user_dependency, id: int, db: db_dependency):
    ticket = db.query(Tickets).filter(Tickets.id == id, Tickets.created_by == user.id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    db.delete(ticket)
    db.commit()
    
    return {
        "message": "Ticket deleted successfully"
    }
    