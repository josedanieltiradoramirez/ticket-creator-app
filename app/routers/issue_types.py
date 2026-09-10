from typing import List, Optional, Annotated

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, selectinload

from app.core.database import get_db
from app.models.issue_types import IssueTypes
from app.models.users import Users
from app.models.tools import Tools
from app.models.knowledge_base import KnowledgeBase
from app.models.troubleshooting_templates import TroubleshootingTemplates
from app.routers.auth import get_current_user

from app.schemas.issue_types import (
    IssueTypeCreate,
    IssueTypeUpdate,
    IssueTypeResponse,
    IssueTypeDetailResponse
)


router = APIRouter(
    prefix="/issue_types",
    tags=["issue_types"]
)


db_dependency = Annotated[
    Session,
    Depends(get_db)
]

user_dependency = Annotated[
    Users,
    Depends(get_current_user)
]


# ============================================================
# LIST ALL ISSUE TYPES
# ============================================================

@router.get(
    "/",
    response_model=List[IssueTypeResponse]
)
async def get_all_issue_types(
    user: user_dependency,
    db: db_dependency
):

    issue_types = (
        db.query(IssueTypes)
        .filter(
            IssueTypes.created_by == user.id
        )
        .all()
    )

    return issue_types


# ============================================================
# ISSUE TYPE RELATIONSHIPS
# ============================================================


# -------------------------
# TOOLS
# -------------------------

@router.get("/{id}/tools")
async def get_issue_type_tools(
    user: user_dependency,
    id: int,
    db: db_dependency
):

    issue_type = (
        db.query(IssueTypes)
        .filter(
            IssueTypes.id == id,
            IssueTypes.created_by == user.id
        )
        .first()
    )

    if not issue_type:
        raise HTTPException(
            status_code=404,
            detail="Issue type not found"
        )

    return issue_type.tools


@router.post("/{id}/tools/{tool_id}")
async def add_issue_type_tool(
    user: user_dependency,
    id: int,
    tool_id: int,
    db: db_dependency
):

    issue_type = (
        db.query(IssueTypes)
        .filter(
            IssueTypes.id == id,
            IssueTypes.created_by == user.id
        )
        .first()
    )

    if not issue_type:
        raise HTTPException(
            status_code=404,
            detail="Issue type not found"
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

    if tool in issue_type.tools:

        return {
            "message":
                "Tool already associated with issue type"
        }

    issue_type.tools.append(tool)

    db.commit()

    return {
        "message":
            "Tool added to issue type"
    }


@router.delete("/{id}/tools/{tool_id}")
async def remove_issue_type_tool(
    user: user_dependency,
    id: int,
    tool_id: int,
    db: db_dependency
):

    issue_type = (
        db.query(IssueTypes)
        .filter(
            IssueTypes.id == id,
            IssueTypes.created_by == user.id
        )
        .first()
    )

    if not issue_type:
        raise HTTPException(
            status_code=404,
            detail="Issue type not found"
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

    if tool not in issue_type.tools:

        raise HTTPException(
            status_code=404,
            detail="Tool is not associated with this issue type"
        )

    issue_type.tools.remove(tool)

    db.commit()

    return {
        "message":
            "Tool removed from issue type"
    }


# -------------------------
# TROUBLESHOOTING TEMPLATES
# -------------------------

@router.get("/{id}/troubleshooting-templates")
async def get_issue_type_troubleshooting_templates(
    user: user_dependency,
    id: int,
    db: db_dependency
):

    issue_type = (
        db.query(IssueTypes)
        .filter(
            IssueTypes.id == id,
            IssueTypes.created_by == user.id
        )
        .first()
    )

    if not issue_type:
        raise HTTPException(
            status_code=404,
            detail="Issue type not found"
        )

    return issue_type.troubleshooting_templates


@router.post(
    "/{id}/troubleshooting-templates/{template_id}"
)
async def add_issue_type_troubleshooting_template(
    user: user_dependency,
    id: int,
    template_id: int,
    db: db_dependency
):

    issue_type = (
        db.query(IssueTypes)
        .filter(
            IssueTypes.id == id,
            IssueTypes.created_by == user.id
        )
        .first()
    )

    if not issue_type:
        raise HTTPException(
            status_code=404,
            detail="Issue type not found"
        )

    template = (
        db.query(TroubleshootingTemplates)
        .filter(
            TroubleshootingTemplates.id == template_id,
            TroubleshootingTemplates.created_by == user.id
        )
        .first()
    )

    if not template:
        raise HTTPException(
            status_code=404,
            detail="Troubleshooting template not found"
        )

    if template in issue_type.troubleshooting_templates:

        return {
            "message":
                "Troubleshooting template already associated with issue type"
        }

    issue_type.troubleshooting_templates.append(
        template
    )

    db.commit()

    return {
        "message":
            "Troubleshooting template added to issue type"
    }


@router.delete(
    "/{id}/troubleshooting-templates/{template_id}"
)
async def remove_issue_type_troubleshooting_template(
    user: user_dependency,
    id: int,
    template_id: int,
    db: db_dependency
):

    issue_type = (
        db.query(IssueTypes)
        .filter(
            IssueTypes.id == id,
            IssueTypes.created_by == user.id
        )
        .first()
    )

    if not issue_type:
        raise HTTPException(
            status_code=404,
            detail="Issue type not found"
        )

    template = (
        db.query(TroubleshootingTemplates)
        .filter(
            TroubleshootingTemplates.id == template_id,
            TroubleshootingTemplates.created_by == user.id
        )
        .first()
    )

    if not template:
        raise HTTPException(
            status_code=404,
            detail="Troubleshooting template not found"
        )

    if template not in issue_type.troubleshooting_templates:

        raise HTTPException(
            status_code=404,
            detail="Troubleshooting template is not associated with this issue type"
        )

    issue_type.troubleshooting_templates.remove(
        template
    )

    db.commit()

    return {
        "message":
            "Troubleshooting template removed from issue type"
    }


# -------------------------
# KNOWLEDGE BASE
# -------------------------

@router.get("/{id}/knowledge-base")
async def get_issue_type_knowledge_base(
    user: user_dependency,
    id: int,
    db: db_dependency
):

    issue_type = (
        db.query(IssueTypes)
        .filter(
            IssueTypes.id == id,
            IssueTypes.created_by == user.id
        )
        .first()
    )

    if not issue_type:
        raise HTTPException(
            status_code=404,
            detail="Issue type not found"
        )

    return issue_type.knowledge_base


@router.post("/{id}/knowledge-base/{knowledge_base_id}")
async def add_issue_type_knowledge_base(
    user: user_dependency,
    id: int,
    knowledge_base_id: int,
    db: db_dependency
):

    issue_type = (
        db.query(IssueTypes)
        .filter(
            IssueTypes.id == id,
            IssueTypes.created_by == user.id
        )
        .first()
    )

    if not issue_type:
        raise HTTPException(
            status_code=404,
            detail="Issue type not found"
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
            detail="Knowledge base item not found"
        )

    if knowledge_base in issue_type.knowledge_base:

        return {
            "message":
                "Knowledge base item already associated with issue type"
        }

    issue_type.knowledge_base.append(
        knowledge_base
    )

    db.commit()

    return {
        "message":
            "Knowledge base item added to issue type"
    }


@router.delete("/{id}/knowledge-base/{knowledge_base_id}")
async def remove_issue_type_knowledge_base(
    user: user_dependency,
    id: int,
    knowledge_base_id: int,
    db: db_dependency
):

    issue_type = (
        db.query(IssueTypes)
        .filter(
            IssueTypes.id == id,
            IssueTypes.created_by == user.id
        )
        .first()
    )

    if not issue_type:
        raise HTTPException(
            status_code=404,
            detail="Issue type not found"
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
            detail="Knowledge base item not found"
        )

    if knowledge_base not in issue_type.knowledge_base:

        raise HTTPException(
            status_code=404,
            detail="Knowledge base item is not associated with this issue type"
        )

    issue_type.knowledge_base.remove(
        knowledge_base
    )

    db.commit()

    return {
        "message":
            "Knowledge base item removed from issue type"
    }


# -------------------------
# FORM
# -------------------------

@router.get("/{id}/form")
async def get_issue_type_form(
    user: user_dependency,
    id: int,
    db: db_dependency
):

    issue_type = (
        db.query(IssueTypes)
        .filter(
            IssueTypes.id == id,
            IssueTypes.created_by == user.id
        )
        .first()
    )

    if not issue_type:
        raise HTTPException(
            status_code=404,
            detail="Issue type not found"
        )

    if not issue_type.form:
        return []

    return [issue_type.form]


# ============================================================
# GET ISSUE TYPE BY ID
# ============================================================

@router.get(
    "/{id}",
    response_model=IssueTypeDetailResponse
)
async def get_issue_type_by_id(
    user: user_dependency,
    id: int,
    db: db_dependency
):

    issue_type = (
        db.query(IssueTypes)
        .options(
            selectinload(IssueTypes.form),
            selectinload(IssueTypes.knowledge_base),
            selectinload(IssueTypes.tools),
            selectinload(
                IssueTypes.troubleshooting_templates
            ),
        )
        .filter(
            IssueTypes.id == id,
            IssueTypes.created_by == user.id
        )
        .first()
    )

    if not issue_type:

        raise HTTPException(
            status_code=404,
            detail="Issue type not found"
        )

    return issue_type


# ============================================================
# CREATE
# ============================================================

@router.post(
    "/",
    response_model=IssueTypeResponse,
    status_code=201
)
async def create_issue_type(
    user: user_dependency,
    issue_type: IssueTypeCreate,
    db: db_dependency
):

    issue_type_data = issue_type.model_dump()

    new_issue_type = IssueTypes(
        **issue_type_data,
        created_by=user.id
    )

    db.add(new_issue_type)

    db.commit()

    db.refresh(new_issue_type)

    return new_issue_type


# ============================================================
# UPDATE
# ============================================================

@router.put(
    "/{id}",
    response_model=IssueTypeResponse
)
async def edit_issue_type(
    user: user_dependency,
    id: int,
    issue_type: IssueTypeUpdate,
    db: db_dependency
):

    existing_issue_type = (
        db.query(IssueTypes)
        .filter(
            IssueTypes.id == id,
            IssueTypes.created_by == user.id
        )
        .first()
    )

    if not existing_issue_type:

        raise HTTPException(
            status_code=404,
            detail="Issue type not found"
        )

    issue_type_data = issue_type.model_dump()

    for key, value in issue_type_data.items():

        setattr(
            existing_issue_type,
            key,
            value
        )

    db.commit()

    db.refresh(existing_issue_type)

    return existing_issue_type


# ============================================================
# DELETE
# ============================================================

@router.delete("/{id}")
async def delete_issue_type(
    user: user_dependency,
    id: int,
    db: db_dependency
):

    issue_type = (
        db.query(IssueTypes)
        .filter(
            IssueTypes.id == id,
            IssueTypes.created_by == user.id
        )
        .first()
    )

    if not issue_type:

        raise HTTPException(
            status_code=404,
            detail="Issue type not found"
        )

    db.delete(issue_type)

    db.commit()

    return {
        "message":
            "Issue type deleted successfully"
    }