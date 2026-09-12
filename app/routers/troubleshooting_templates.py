from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, selectinload
from typing import Annotated

from app.core.database import get_db

from app.models.issue_types import IssueTypes
from app.models.knowledge_base import KnowledgeBase
from app.models.tools import Tools
from app.models.troubleshooting_templates import TroubleshootingTemplates
from app.models.users import Users

from app.routers.auth import get_current_user

from app.schemas.troubleshooting_templates import (
    TroubleshootingTemplateCreate,
    TroubleshootingTemplateUpdate,
    TroubleshootingTemplateResponse,
    TroubleshootingTemplateDetailResponse
)


router = APIRouter(
    prefix="/troubleshooting_templates",
    tags=["troubleshooting_templates"]
)


db_dependency = Annotated[Session, Depends(get_db)]
user_dependency = Annotated[Users, Depends(get_current_user)]


# ============================================================
# GET ALL
# ============================================================

@router.get(
    "/",
    response_model=List[TroubleshootingTemplateDetailResponse]
)
async def get_all_troubleshooting_templates(
    user: user_dependency,
    db: db_dependency
):
    troubleshooting_templates = (
        db.query(TroubleshootingTemplates)
        .options(
            selectinload(TroubleshootingTemplates.issue_types),
            selectinload(TroubleshootingTemplates.knowledge_base),
            selectinload(TroubleshootingTemplates.tools)
        )
        .filter(
            TroubleshootingTemplates.created_by == user.id
        )
        .all()
    )

    return troubleshooting_templates


# ============================================================
# GET BY ID
# ============================================================

@router.get(
    "/{id}",
    response_model=TroubleshootingTemplateResponse
)
async def get_troubleshooting_template_by_id(
    user: user_dependency,
    id: int,
    db: db_dependency
):

    troubleshooting_template = (
        db.query(TroubleshootingTemplates)
        .options(
            selectinload(TroubleshootingTemplates.issue_types),
            selectinload(TroubleshootingTemplates.knowledge_base),
            selectinload(TroubleshootingTemplates.tools)
        )
        .filter(
            TroubleshootingTemplates.id == id,
            TroubleshootingTemplates.created_by == user.id
        )
        .first()
    )

    if not troubleshooting_template:
        raise HTTPException(
            status_code=404,
            detail="Troubleshooting template not found"
        )

    return troubleshooting_template


# ============================================================
# ISSUE TYPES
# ============================================================

@router.get("/{id}/issue-types")
async def get_troubleshooting_template_issue_types(
    user: user_dependency,
    id: int,
    db: db_dependency
):

    troubleshooting_template = (
        db.query(TroubleshootingTemplates)
        .options(
            selectinload(TroubleshootingTemplates.issue_types)
        )
        .filter(
            TroubleshootingTemplates.id == id,
            TroubleshootingTemplates.created_by == user.id
        )
        .first()
    )

    if not troubleshooting_template:
        raise HTTPException(
            status_code=404,
            detail="Troubleshooting template not found"
        )

    return troubleshooting_template.issue_types


@router.post("/{id}/issue-types/{issue_type_id}")
async def add_issue_type_to_troubleshooting_template(
    user: user_dependency,
    id: int,
    issue_type_id: int,
    db: db_dependency
):

    troubleshooting_template = (
        db.query(TroubleshootingTemplates)
        .filter(
            TroubleshootingTemplates.id == id,
            TroubleshootingTemplates.created_by == user.id
        )
        .first()
    )

    if not troubleshooting_template:
        raise HTTPException(
            status_code=404,
            detail="Troubleshooting template not found"
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

    if issue_type not in troubleshooting_template.issue_types:
        troubleshooting_template.issue_types.append(issue_type)

    db.commit()

    return {
        "message": "Issue Type added successfully"
    }


@router.delete("/{id}/issue-types/{issue_type_id}")
async def remove_issue_type_from_troubleshooting_template(
    user: user_dependency,
    id: int,
    issue_type_id: int,
    db: db_dependency
):

    troubleshooting_template = (
        db.query(TroubleshootingTemplates)
        .filter(
            TroubleshootingTemplates.id == id,
            TroubleshootingTemplates.created_by == user.id
        )
        .first()
    )

    if not troubleshooting_template:
        raise HTTPException(
            status_code=404,
            detail="Troubleshooting template not found"
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

    if issue_type in troubleshooting_template.issue_types:
        troubleshooting_template.issue_types.remove(issue_type)

    db.commit()

    return {
        "message": "Issue Type removed successfully"
    }


# ============================================================
# KNOWLEDGE BASE
# ============================================================

@router.get("/{id}/knowledge-base")
async def get_troubleshooting_template_knowledge_base(
    user: user_dependency,
    id: int,
    db: db_dependency
):

    troubleshooting_template = (
        db.query(TroubleshootingTemplates)
        .options(
            selectinload(TroubleshootingTemplates.knowledge_base)
        )
        .filter(
            TroubleshootingTemplates.id == id,
            TroubleshootingTemplates.created_by == user.id
        )
        .first()
    )

    if not troubleshooting_template:
        raise HTTPException(
            status_code=404,
            detail="Troubleshooting template not found"
        )

    return troubleshooting_template.knowledge_base


@router.post("/{id}/knowledge-base/{knowledge_base_id}")
async def add_knowledge_base_to_troubleshooting_template(
    user: user_dependency,
    id: int,
    knowledge_base_id: int,
    db: db_dependency
):

    troubleshooting_template = (
        db.query(TroubleshootingTemplates)
        .filter(
            TroubleshootingTemplates.id == id,
            TroubleshootingTemplates.created_by == user.id
        )
        .first()
    )

    if not troubleshooting_template:
        raise HTTPException(
            status_code=404,
            detail="Troubleshooting template not found"
        )

    knowledge_base = (
        db.query(KnowledgeBase)
        .filter(
            KnowledgeBase.id == knowledge_base_id,
            KnowledgeBase.created_by == user.id
        )
        .first()
    )

    if not knowledge_base:
        raise HTTPException(
            status_code=404,
            detail="Knowledge Base item not found"
        )

    if knowledge_base not in troubleshooting_template.knowledge_base:
        troubleshooting_template.knowledge_base.append(knowledge_base)

    db.commit()

    return {
        "message": "Knowledge Base item added successfully"
    }


@router.delete("/{id}/knowledge-base/{knowledge_base_id}")
async def remove_knowledge_base_from_troubleshooting_template(
    user: user_dependency,
    id: int,
    knowledge_base_id: int,
    db: db_dependency
):

    troubleshooting_template = (
        db.query(TroubleshootingTemplates)
        .filter(
            TroubleshootingTemplates.id == id,
            TroubleshootingTemplates.created_by == user.id
        )
        .first()
    )

    if not troubleshooting_template:
        raise HTTPException(
            status_code=404,
            detail="Troubleshooting template not found"
        )

    knowledge_base = (
        db.query(KnowledgeBase)
        .filter(
            KnowledgeBase.id == knowledge_base_id,
            KnowledgeBase.created_by == user.id
        )
        .first()
    )

    if not knowledge_base:
        raise HTTPException(
            status_code=404,
            detail="Knowledge Base item not found"
        )

    if knowledge_base in troubleshooting_template.knowledge_base:
        troubleshooting_template.knowledge_base.remove(knowledge_base)

    db.commit()

    return {
        "message": "Knowledge Base item removed successfully"
    }


# ============================================================
# TOOLS
# ============================================================

@router.get("/{id}/tools")
async def get_troubleshooting_template_tools(
    user: user_dependency,
    id: int,
    db: db_dependency
):

    troubleshooting_template = (
        db.query(TroubleshootingTemplates)
        .options(
            selectinload(TroubleshootingTemplates.tools)
        )
        .filter(
            TroubleshootingTemplates.id == id,
            TroubleshootingTemplates.created_by == user.id
        )
        .first()
    )

    if not troubleshooting_template:
        raise HTTPException(
            status_code=404,
            detail="Troubleshooting template not found"
        )

    return troubleshooting_template.tools


@router.post("/{id}/tools/{tool_id}")
async def add_tool_to_troubleshooting_template(
    user: user_dependency,
    id: int,
    tool_id: int,
    db: db_dependency
):

    troubleshooting_template = (
        db.query(TroubleshootingTemplates)
        .filter(
            TroubleshootingTemplates.id == id,
            TroubleshootingTemplates.created_by == user.id
        )
        .first()
    )

    if not troubleshooting_template:
        raise HTTPException(
            status_code=404,
            detail="Troubleshooting template not found"
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

    if tool not in troubleshooting_template.tools:
        troubleshooting_template.tools.append(tool)

    db.commit()

    return {
        "message": "Tool added successfully"
    }


@router.delete("/{id}/tools/{tool_id}")
async def remove_tool_from_troubleshooting_template(
    user: user_dependency,
    id: int,
    tool_id: int,
    db: db_dependency
):

    troubleshooting_template = (
        db.query(TroubleshootingTemplates)
        .filter(
            TroubleshootingTemplates.id == id,
            TroubleshootingTemplates.created_by == user.id
        )
        .first()
    )

    if not troubleshooting_template:
        raise HTTPException(
            status_code=404,
            detail="Troubleshooting template not found"
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

    if tool in troubleshooting_template.tools:
        troubleshooting_template.tools.remove(tool)

    db.commit()

    return {
        "message": "Tool removed successfully"
    }


# ============================================================
# CREATE
# ============================================================

@router.post(
    "/",
    response_model=TroubleshootingTemplateResponse,
    status_code=201
)
async def create_troubleshooting_template(
    user: user_dependency,
    troubleshooting_template: TroubleshootingTemplateCreate,
    db: db_dependency
):

    troubleshooting_template_data = (
        troubleshooting_template.model_dump()
    )

    new_troubleshooting_template = TroubleshootingTemplates(
        **troubleshooting_template_data,
        created_by=user.id
    )

    db.add(new_troubleshooting_template)
    db.commit()
    db.refresh(new_troubleshooting_template)

    return new_troubleshooting_template


# ============================================================
# UPDATE
# ============================================================

@router.put(
    "/{id}",
    response_model=TroubleshootingTemplateResponse
)
async def edit_troubleshooting_template(
    user: user_dependency,
    id: int,
    troubleshooting_template: TroubleshootingTemplateUpdate,
    db: db_dependency
):

    existing_troubleshooting_template = (
        db.query(TroubleshootingTemplates)
        .filter(
            TroubleshootingTemplates.id == id,
            TroubleshootingTemplates.created_by == user.id
        )
        .first()
    )

    if not existing_troubleshooting_template:
        raise HTTPException(
            status_code=404,
            detail="Troubleshooting template not found"
        )

    existing_troubleshooting_template.name = (
        troubleshooting_template.name
    )

    existing_troubleshooting_template.steps = (
        troubleshooting_template.steps
    )

    existing_troubleshooting_template.generated_description = (
        troubleshooting_template.generated_description
    )

    existing_troubleshooting_template.is_active = (
        troubleshooting_template.is_active
    )

    if troubleshooting_template.issue_types is not None:

        issue_types = (
            db.query(IssueTypes)
            .filter(
                IssueTypes.id.in_(
                    troubleshooting_template.issue_types
                ),
                IssueTypes.created_by == user.id
            )
            .all()
        )

        existing_troubleshooting_template.issue_types = issue_types

    if troubleshooting_template.knowledge_base is not None:

        knowledge_base = (
            db.query(KnowledgeBase)
            .filter(
                KnowledgeBase.id.in_(
                    troubleshooting_template.knowledge_base
                ),
                KnowledgeBase.created_by == user.id
            )
            .all()
        )

        existing_troubleshooting_template.knowledge_base = (
            knowledge_base
        )

    if troubleshooting_template.tools is not None:

        tools = (
            db.query(Tools)
            .filter(
                Tools.id.in_(
                    troubleshooting_template.tools
                ),
                Tools.created_by == user.id
            )
            .all()
        )

        existing_troubleshooting_template.tools = tools

    db.commit()
    db.refresh(existing_troubleshooting_template)

    return existing_troubleshooting_template


# ============================================================
# DELETE
# ============================================================

@router.delete("/{id}")
async def delete_troubleshooting_template(
    user: user_dependency,
    id: int,
    db: db_dependency
):

    troubleshooting_template = (
        db.query(TroubleshootingTemplates)
        .filter(
            TroubleshootingTemplates.id == id,
            TroubleshootingTemplates.created_by == user.id
        )
        .first()
    )

    if not troubleshooting_template:
        raise HTTPException(
            status_code=404,
            detail="Troubleshooting template not found"
        )

    db.delete(troubleshooting_template)
    db.commit()

    return {
        "message": "Troubleshooting template deleted successfully"
    }