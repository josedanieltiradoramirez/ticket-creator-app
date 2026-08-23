from typing import List
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.tickets import Tickets
from app.models.users import Users
from app.routers.auth import get_current_user
from app.schemas.tickets import TicketCreate, TicketUpdate, TicketResponse, TicketDetailResponse
from sqlalchemy.orm import selectinload
from app.models.forms import Forms


router = APIRouter(
    prefix="/tickets",
    tags=["tickets"],
)

db_dependency = Annotated[Session, Depends(get_db)]
user_dependency = Annotated[Users, Depends(get_current_user)]


@router.get("/", response_model=List[TicketResponse])
async def get_all_tickets(user: user_dependency, db: db_dependency):
    return (
        db.query(Tickets)
        .filter(Tickets.created_by == user.id)
        .all()
    )


@router.get("/{id}", response_model=TicketDetailResponse)
async def get_ticket_by_id(
    id: int,
    user: user_dependency,
    db: db_dependency,
):
    ticket = (
        db.query(Tickets)
        .options(
            selectinload(Tickets.tool),
            selectinload(Tickets.issue_type),
            selectinload(Tickets.knowledge_base),
            selectinload(Tickets.troubleshooting_template),
            selectinload(Tickets.form_template)
                .selectinload(Forms.form_fields),
            selectinload(Tickets.queue),
            selectinload(Tickets.status),
            selectinload(Tickets.location),
            selectinload(Tickets.priority),
        )
        .filter(
            Tickets.id == id,
            Tickets.created_by == user.id,
        )
        .first()
    )

    if not ticket:
        raise HTTPException(
            status_code=404,
            detail="Ticket not found",
        )

    return ticket


@router.post("/", response_model=TicketResponse, status_code=201)
async def create_ticket(
    ticket: TicketCreate,
    user: user_dependency,
    db: db_dependency,
):
    new_ticket = Tickets(
        **ticket.model_dump(),
        created_by=user.id,
    )

    db.add(new_ticket)
    db.commit()
    db.refresh(new_ticket)

    return new_ticket


@router.put("/{id}", response_model=TicketResponse)
async def update_ticket(
    id: int,
    ticket: TicketUpdate,
    user: user_dependency,
    db: db_dependency,
):
    existing_ticket = (
        db.query(Tickets)
        .filter(
            Tickets.id == id,
            Tickets.created_by == user.id,
        )
        .first()
    )

    if not existing_ticket:
        raise HTTPException(
            status_code=404,
            detail="Ticket not found",
        )

    update_data = ticket.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(existing_ticket, field, value)

    db.commit()
    db.refresh(existing_ticket)

    return existing_ticket


@router.delete("/{id}", status_code=204)
async def delete_ticket(
    id: int,
    user: user_dependency,
    db: db_dependency,
):
    ticket = (
        db.query(Tickets)
        .filter(
            Tickets.id == id,
            Tickets.created_by == user.id,
        )
        .first()
    )

    if not ticket:
        raise HTTPException(
            status_code=404,
            detail="Ticket not found",
        )

    db.delete(ticket)
    db.commit()