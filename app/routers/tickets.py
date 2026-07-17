from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Annotated

from app.core.database import get_db
from app.models.tickets import Ticket
from app.models.users import Users
from app.routers.auth import get_current_user


def apply_multiple_relationship_filter(query, relationship, model_class, selected_ids):
    for selected_id in selected_ids:
        query = query.filter(relationship.any(model_class.id == selected_id))
    return query


router = APIRouter(
    prefix='/tickets',
    tags=['tickets']) 

tickets = []

db_dependency = Annotated[Session, Depends(get_db)]
user_dependency = Annotated[Users, Depends(get_current_user)]

class TicketSchema(BaseModel):
    ticket_number: str
    title: str
    location: Optional[str] = None
    user_name: Optional[str] = None
    user_type: Optional[str] = None
    user_best_contact_number: Optional[str] = None
    user_email: Optional[str] = None
    issue_description: str
    issue: str
    troubleshooting_steps: str
    content: str
    kb: Optional[int] = None
    date: Optional[str] = None

@router.get("/")
async def get_all_tickets(user : user_dependency, db: db_dependency):
    tickets = db.query(Ticket).all()
    result = []
    for ticket in tickets:
        result.append({
            "id": ticket.ticket_number,
            "title": ticket.title,
            "content": ticket.content,
            "employee": ticket.user_name,
            "location": ticket.location,
            "date": ticket.date
        })
    return result

@router.post("/")
async def create_ticket(user : user_dependency, ticket: TicketSchema, db: db_dependency):
    new_ticket = Ticket(
        ticket_number=ticket.ticket_number,
        title=ticket.title,
        content=ticket.content,
        user_name=ticket.user_name,
        location=ticket.location,
        date=ticket.date,
        user_id = user.id
    )

    db.add(new_ticket)
    db.commit()
    db.refresh(new_ticket)
    return new_ticket


@router.put("/{id}")
async def edit_note(user: user_dependency, id: int, note: TicketSchema, db: db_dependency):
    existing_ticket = db.query(Ticket).filter(Ticket.id == id, Ticket.user_id == user.id).first()
    if not existing_ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    existing_ticket.title = note.title
    existing_ticket.content = note.content
    existing_ticket.type = note.type

    db.commit()
    db.refresh(existing_ticket)
    return existing_ticket
    


@router.delete("/{id}")
async def delete_note(user: user_dependency, id: int, db: db_dependency):
    note = db.query(Ticket).filter(Ticket.id == id, Ticket.user_id == user.id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Ticket not found")
    db.delete(note)
    db.commit()
    
    return {"ok" : True}
    