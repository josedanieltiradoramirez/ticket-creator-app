from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Annotated

from app.core.database import get_db
from app.models.queues import Queues
from app.models.ticket_status import TicketStatus
from app.models.users import Users
from app.models.issue_types import IssueTypes
from app.models.tools import Tools
from app.routers.auth import get_current_user

from app.schemas.queues import QueueCreate, QueueUpdate, QueueResponse


router = APIRouter(
    prefix='/queues',
    tags=['queues']
)


db_dependency = Annotated[Session, Depends(get_db)]
user_dependency = Annotated[Users, Depends(get_current_user)]


# ============================================================
# GET ALL QUEUES
# ============================================================

@router.get("/", response_model=List[QueueResponse])
async def get_all_queues(
    user: user_dependency,
    db: db_dependency
):
    queues = (
        db.query(Queues)
        .filter(Queues.created_by == user.id)
        .all()
    )

    return queues


# ============================================================
# QUEUE ↔ ISSUE TYPES
# ============================================================

@router.get("/{id}/issue-types")
async def get_queue_issue_types(
    user: user_dependency,
    id: int,
    db: db_dependency
):
    queue = (
        db.query(Queues)
        .filter(
            Queues.id == id,
            Queues.created_by == user.id
        )
        .first()
    )

    if not queue:
        raise HTTPException(
            status_code=404,
            detail="Queue not found"
        )

    return queue.issue_types


@router.post("/{id}/issue-types/{issue_type_id}")
async def add_queue_issue_type(
    user: user_dependency,
    id: int,
    issue_type_id: int,
    db: db_dependency
):
    queue = (
        db.query(Queues)
        .filter(
            Queues.id == id,
            Queues.created_by == user.id
        )
        .first()
    )

    if not queue:
        raise HTTPException(
            status_code=404,
            detail="Queue not found"
        )

    issue_type = (
        db.query(IssueTypes)
        .filter(
            IssueTypes.id == issue_type_id,
            IssueTypes.created_by == user.id
        )
        .first()
    )

    if not issue_type:
        raise HTTPException(
            status_code=404,
            detail="Issue Type not found"
        )

    if issue_type in queue.issue_types:
        raise HTTPException(
            status_code=400,
            detail="Issue Type is already associated with this Queue"
        )

    queue.issue_types.append(issue_type)

    db.commit()

    return {
        "message": "Issue Type added to Queue successfully"
    }


@router.delete("/{id}/issue-types/{issue_type_id}")
async def remove_queue_issue_type(
    user: user_dependency,
    id: int,
    issue_type_id: int,
    db: db_dependency
):
    queue = (
        db.query(Queues)
        .filter(
            Queues.id == id,
            Queues.created_by == user.id
        )
        .first()
    )

    if not queue:
        raise HTTPException(
            status_code=404,
            detail="Queue not found"
        )

    issue_type = (
        db.query(IssueTypes)
        .filter(
            IssueTypes.id == issue_type_id,
            IssueTypes.created_by == user.id
        )
        .first()
    )

    if not issue_type:
        raise HTTPException(
            status_code=404,
            detail="Issue Type not found"
        )

    if issue_type not in queue.issue_types:
        raise HTTPException(
            status_code=404,
            detail="Issue Type is not associated with this Queue"
        )

    queue.issue_types.remove(issue_type)

    db.commit()

    return {
        "message": "Issue Type removed from Queue successfully"
    }


# ============================================================
# QUEUE ↔ TOOLS
# ============================================================

@router.get("/{id}/tools")
async def get_queue_tools(
    user: user_dependency,
    id: int,
    db: db_dependency
):
    queue = (
        db.query(Queues)
        .filter(
            Queues.id == id,
            Queues.created_by == user.id
        )
        .first()
    )

    if not queue:
        raise HTTPException(
            status_code=404,
            detail="Queue not found"
        )

    return queue.tools


@router.post("/{id}/tools/{tool_id}")
async def add_queue_tool(
    user: user_dependency,
    id: int,
    tool_id: int,
    db: db_dependency
):
    queue = (
        db.query(Queues)
        .filter(
            Queues.id == id,
            Queues.created_by == user.id
        )
        .first()
    )

    if not queue:
        raise HTTPException(
            status_code=404,
            detail="Queue not found"
        )

    tool = (
        db.query(Tools)
        .filter(
            Tools.id == tool_id,
            Tools.created_by == user.id
        )
        .first()
    )

    if not tool:
        raise HTTPException(
            status_code=404,
            detail="Tool not found"
        )

    if tool in queue.tools:
        raise HTTPException(
            status_code=400,
            detail="Tool is already associated with this Queue"
        )

    queue.tools.append(tool)

    db.commit()

    return {
        "message": "Tool added to Queue successfully"
    }


@router.delete("/{id}/tools/{tool_id}")
async def remove_queue_tool(
    user: user_dependency,
    id: int,
    tool_id: int,
    db: db_dependency
):
    queue = (
        db.query(Queues)
        .filter(
            Queues.id == id,
            Queues.created_by == user.id
        )
        .first()
    )

    if not queue:
        raise HTTPException(
            status_code=404,
            detail="Queue not found"
        )

    tool = (
        db.query(Tools)
        .filter(
            Tools.id == tool_id,
            Tools.created_by == user.id
        )
        .first()
    )

    if not tool:
        raise HTTPException(
            status_code=404,
            detail="Tool not found"
        )

    if tool not in queue.tools:
        raise HTTPException(
            status_code=404,
            detail="Tool is not associated with this Queue"
        )

    queue.tools.remove(tool)

    db.commit()

    return {
        "message": "Tool removed from Queue successfully"
    }


# ============================================================
# GET QUEUE BY ID
# ============================================================

@router.get("/{id}", response_model=QueueResponse)
async def get_queue_by_id(
    user: user_dependency,
    id: int,
    db: db_dependency
):
    queue = (
        db.query(Queues)
        .filter(
            Queues.id == id,
            Queues.created_by == user.id
        )
        .first()
    )

    if not queue:
        raise HTTPException(
            status_code=404,
            detail="Queue not found"
        )

    return queue


# ============================================================
# CREATE QUEUE
# ============================================================

@router.post("/", response_model=QueueResponse, status_code=201)
async def create_queue(
    user: user_dependency,
    queue: QueueCreate,
    db: db_dependency
):
    queue_data = queue.model_dump()

    new_queue = Queues(
        **queue_data,
        created_by=user.id
    )

    db.add(new_queue)
    db.commit()
    db.refresh(new_queue)

    return new_queue


# ============================================================
# UPDATE QUEUE
# ============================================================

@router.put("/{id}", response_model=QueueResponse)
async def edit_queue(
    user: user_dependency,
    id: int,
    queue: QueueUpdate,
    db: db_dependency
):
    existing_queue = (
        db.query(Queues)
        .filter(
            Queues.id == id,
            Queues.created_by == user.id
        )
        .first()
    )

    if not existing_queue:
        raise HTTPException(
            status_code=404,
            detail="Queue not found"
        )

    queue_data = queue.model_dump()

    for key, value in queue_data.items():
        setattr(existing_queue, key, value)

    db.commit()
    db.refresh(existing_queue)

    return existing_queue


# ============================================================
# DELETE QUEUE
# ============================================================

@router.delete("/{id}")
async def delete_queue(
    user: user_dependency,
    id: int,
    db: db_dependency
):
    queue = (
        db.query(Queues)
        .filter(
            Queues.id == id,
            Queues.created_by == user.id
        )
        .first()
    )

    if not queue:
        raise HTTPException(
            status_code=404,
            detail="Queue not found"
        )

    db.delete(queue)
    db.commit()

    return {
        "message": "Queue deleted successfully"
    }