from typing import Annotated, List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, selectinload

from app.core.database import get_db
from app.models.knowledge_base_notes import KnowledgeBaseNotes
from app.models.tools import Tools
from app.models.users import Users
from app.routers.auth import get_current_user

from app.schemas.knowledge_base_notes import (
    KnowledgeBaseNoteCreate,
    KnowledgeBaseNoteUpdate,
    KnowledgeBaseNoteResponse,
    KnowledgeBaseNoteDetailResponse,
)


router = APIRouter(
    prefix="/knowledge_base_notes",
    tags=["knowledge_base_notes"]
)

db_dependency = Annotated[Session, Depends(get_db)]
user_dependency = Annotated[Users, Depends(get_current_user)]


# =========================================================
# GET ALL
# =========================================================

@router.get(
    "/",
    response_model=List[KnowledgeBaseNoteResponse]
)
async def get_all_knowledge_base_notes(
    user: user_dependency,
    db: db_dependency
):
    notes = (
        db.query(KnowledgeBaseNotes)
        .filter(KnowledgeBaseNotes.created_by == user.id)
        .all()
    )

    return notes


# =========================================================
# GET BY ID
# =========================================================

@router.get(
    "/{id}",
    response_model=KnowledgeBaseNoteDetailResponse
)
async def get_knowledge_base_note_by_id(
    user: user_dependency,
    id: int,
    db: db_dependency
):
    note = (
        db.query(KnowledgeBaseNotes)
        .options(
            selectinload(KnowledgeBaseNotes.tools)
        )
        .filter(
            KnowledgeBaseNotes.id == id,
            KnowledgeBaseNotes.created_by == user.id
        )
        .first()
    )

    if not note:
        raise HTTPException(
            status_code=404,
            detail="Knowledge Base Note not found"
        )

    return note


# =========================================================
# CREATE
# =========================================================

@router.post(
    "/",
    response_model=KnowledgeBaseNoteResponse,
    status_code=201
)
async def create_knowledge_base_note(
    note: KnowledgeBaseNoteCreate,
    user: user_dependency,
    db: db_dependency
):
    new_note = KnowledgeBaseNotes(
        **note.model_dump(),
        created_by=user.id
    )

    db.add(new_note)
    db.commit()
    db.refresh(new_note)

    return new_note


# =========================================================
# UPDATE
# =========================================================

@router.put(
    "/{id}",
    response_model=KnowledgeBaseNoteResponse
)
async def edit_knowledge_base_note(
    id: int,
    note: KnowledgeBaseNoteUpdate,
    user: user_dependency,
    db: db_dependency
):
    existing_note = (
        db.query(KnowledgeBaseNotes)
        .filter(
            KnowledgeBaseNotes.id == id,
            KnowledgeBaseNotes.created_by == user.id
        )
        .first()
    )

    if not existing_note:
        raise HTTPException(
            status_code=404,
            detail="Knowledge Base Note not found"
        )

    update_data = note.model_dump(
        exclude_unset=True
    )

    for key, value in update_data.items():
        setattr(existing_note, key, value)

    db.commit()
    db.refresh(existing_note)

    return existing_note


# =========================================================
# DELETE
# =========================================================

@router.delete("/{id}")
async def delete_knowledge_base_note(
    id: int,
    user: user_dependency,
    db: db_dependency
):
    existing_note = (
        db.query(KnowledgeBaseNotes)
        .filter(
            KnowledgeBaseNotes.id == id,
            KnowledgeBaseNotes.created_by == user.id
        )
        .first()
    )

    if not existing_note:
        raise HTTPException(
            status_code=404,
            detail="Knowledge Base Note not found"
        )

    db.delete(existing_note)
    db.commit()

    return {
        "message": "Knowledge Base Note deleted successfully"
    }


# =========================================================
# NOTE ↔ TOOLS
# =========================================================

@router.get("/{id}/tools")
async def get_note_tools(
    user: user_dependency,
    id: int,
    db: db_dependency
):
    note = (
        db.query(KnowledgeBaseNotes)
        .filter(
            KnowledgeBaseNotes.id == id,
            KnowledgeBaseNotes.created_by == user.id
        )
        .first()
    )

    if not note:
        raise HTTPException(
            status_code=404,
            detail="Knowledge Base Note not found"
        )

    return note.tools


@router.post("/{id}/tools/{tool_id}")
async def add_note_tool(
    user: user_dependency,
    id: int,
    tool_id: int,
    db: db_dependency
):
    note = (
        db.query(KnowledgeBaseNotes)
        .filter(
            KnowledgeBaseNotes.id == id,
            KnowledgeBaseNotes.created_by == user.id
        )
        .first()
    )

    if not note:
        raise HTTPException(
            status_code=404,
            detail="Knowledge Base Note not found"
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

    if tool in note.tools:
        raise HTTPException(
            status_code=400,
            detail="Tool is already associated with this Knowledge Base Note"
        )

    note.tools.append(tool)

    db.commit()

    return {
        "message": "Tool added to Knowledge Base Note successfully"
    }


@router.delete("/{id}/tools/{tool_id}")
async def remove_note_tool(
    user: user_dependency,
    id: int,
    tool_id: int,
    db: db_dependency
):
    note = (
        db.query(KnowledgeBaseNotes)
        .filter(
            KnowledgeBaseNotes.id == id,
            KnowledgeBaseNotes.created_by == user.id
        )
        .first()
    )

    if not note:
        raise HTTPException(
            status_code=404,
            detail="Knowledge Base Note not found"
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

    if tool not in note.tools:
        raise HTTPException(
            status_code=404,
            detail="Tool is not associated with this Knowledge Base Note"
        )

    note.tools.remove(tool)

    db.commit()

    return {
        "message": "Tool removed from Knowledge Base Note successfully"
    }