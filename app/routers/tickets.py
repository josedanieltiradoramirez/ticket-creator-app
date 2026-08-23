from datetime import date, timedelta
from math import ceil
from typing import List, Optional
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.tickets import Tickets
from app.models.users import Users
from app.routers.auth import get_current_user
from app.schemas.tickets import TicketCreate, TicketUpdate, TicketResponse, TicketDetailResponse, TicketListResponse
from sqlalchemy.orm import selectinload
from app.models.forms import Forms


router = APIRouter(
    prefix="/tickets",
    tags=["tickets"],
)

db_dependency = Annotated[Session, Depends(get_db)]
user_dependency = Annotated[Users, Depends(get_current_user)]


@router.get("/", response_model=TicketListResponse)
async def get_tickets(
    user: user_dependency,
    db: db_dependency,
    ticket_date: Optional[date] = Query(None),
    issue_type_id: Optional[int] = Query(None),
    status_id: Optional[int] = Query(None),
    priority_id: Optional[int] = Query(None),
    queue_id: Optional[int] = Query(None),
    tool_id: Optional[int] = Query(None),
    location_id: Optional[int] = Query(None),
    created_by_id: Optional[int] = Query(None),
    ticket_number: Optional[str] = Query(None),
    kb_article_id: Optional[int] = Query(None),
    user_name: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
):
    query = (
        db.query(Tickets)
        .filter(Tickets.created_by == user.id)
    )

    if ticket_date:
        query = query.filter(
            Tickets.created_at >= ticket_date,
            Tickets.created_at < ticket_date + timedelta(days=1)
        )
    if issue_type_id is not None:
        query = query.filter(Tickets.issue_type_id == issue_type_id)
    if status_id is not None:
        query = query.filter(Tickets.status_id == status_id)
    if priority_id is not None:
        query = query.filter(Tickets.priority_id == priority_id)
    if queue_id is not None:
        query = query.filter(Tickets.queue_id == queue_id)
    if tool_id is not None:
        query = query.filter(Tickets.tool_id == tool_id)
    if location_id is not None:
        query = query.filter(Tickets.location_id == location_id)
    if created_by_id is not None:
        query = query.filter(Tickets.created_by == created_by_id)
    if ticket_number:
        query = query.filter(Tickets.ticket_number == ticket_number)
    if kb_article_id is not None:
        query = query.filter(Tickets.kb_article_id == kb_article_id)
    if user_name:
        query = query.filter(Tickets.user_name.ilike(f"%{user_name}%"))

    total = query.count()

    offset = (page - 1) * limit

    tickets = (
        query
        .order_by(Tickets.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )

    pages = ceil(total / limit) if total > 0 else 0

    return {
        "items": tickets,
        "total": total,
        "page": page,
        "limit": limit,
        "pages": pages,
    }


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