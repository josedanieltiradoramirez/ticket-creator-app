from typing import List, Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, selectinload

from app.core.database import get_db
from app.models.tools import Tools
from app.models.users import Users
from app.models.issue_types import IssueTypes
from app.models.knowledge_base import KnowledgeBase
from app.models.troubleshooting_templates import TroubleshootingTemplates
from app.routers.auth import get_current_user

from app.schemas.tools import (
    ToolCreate,
    ToolUpdate,
    ToolResponse,
    ToolDetailResponse
)


router = APIRouter(
    prefix="/tools",
    tags=["tools"]
)


db_dependency = Annotated[Session, Depends(get_db)]
user_dependency = Annotated[Users, Depends(get_current_user)]


# ============================================================
# GET ALL TOOLS
# ============================================================

@router.get("/", response_model=List[ToolResponse])
async def get_all_tools(
    user: user_dependency,
    db: db_dependency
):
    tools = (
        db.query(Tools)
        .filter(Tools.created_by == user.id)
        .all()
    )

    return tools


# ============================================================
# GET TOOL BY ID
# ============================================================

@router.get("/{id}", response_model=ToolDetailResponse)
async def get_tool_by_id(
    user: user_dependency,
    id: int,
    db: db_dependency
):
    tool = (
        db.query(Tools)
        .options(
            selectinload(Tools.issue_types),
            selectinload(Tools.knowledge_base),
            selectinload(Tools.troubleshooting_templates),
        )
        .filter(
            Tools.id == id,
            Tools.created_by == user.id
        )
        .first()
    )

    if not tool:
        raise HTTPException(
            status_code=404,
            detail="Tool not found"
        )

    return tool


# ============================================================
# TOOL ↔ ISSUE TYPES
# ============================================================

@router.get("/{id}/issue-types")
async def get_tool_issue_types(
    user: user_dependency,
    id: int,
    db: db_dependency
):
    tool = (
        db.query(Tools)
        .filter(
            Tools.id == id,
            Tools.created_by == user.id
        )
        .first()
    )

    if not tool:
        raise HTTPException(
            status_code=404,
            detail="Tool not found"
        )

    return tool.issue_types


@router.post("/{id}/issue-types/{issue_type_id}")
async def add_tool_issue_type(
    user: user_dependency,
    id: int,
    issue_type_id: int,
    db: db_dependency
):
    tool = (
        db.query(Tools)
        .filter(
            Tools.id == id,
            Tools.created_by == user.id
        )
        .first()
    )

    if not tool:
        raise HTTPException(
            status_code=404,
            detail="Tool not found"
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
            detail="Issue type not found"
        )

    if issue_type in tool.issue_types:
        return {
            "message": "Issue type already associated with tool"
        }

    tool.issue_types.append(issue_type)

    db.commit()

    return {
        "message": "Issue type added to tool"
    }


@router.delete("/{id}/issue-types/{issue_type_id}")
async def remove_tool_issue_type(
    user: user_dependency,
    id: int,
    issue_type_id: int,
    db: db_dependency
):
    tool = (
        db.query(Tools)
        .filter(
            Tools.id == id,
            Tools.created_by == user.id
        )
        .first()
    )

    if not tool:
        raise HTTPException(
            status_code=404,
            detail="Tool not found"
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
            detail="Issue type not found"
        )

    if issue_type not in tool.issue_types:
        raise HTTPException(
            status_code=404,
            detail="Issue type is not associated with this tool"
        )

    tool.issue_types.remove(issue_type)

    db.commit()

    return {
        "message": "Issue type removed from tool"
    }


# ============================================================
# TOOL ↔ KNOWLEDGE BASE
# ============================================================

@router.get("/{id}/knowledge-base")
async def get_tool_knowledge_base(
    user: user_dependency,
    id: int,
    db: db_dependency
):
    tool = (
        db.query(Tools)
        .filter(
            Tools.id == id,
            Tools.created_by == user.id
        )
        .first()
    )

    if not tool:
        raise HTTPException(
            status_code=404,
            detail="Tool not found"
        )

    return tool.knowledge_base


@router.post("/{id}/knowledge-base/{knowledge_base_id}")
async def add_tool_knowledge_base(
    user: user_dependency,
    id: int,
    knowledge_base_id: int,
    db: db_dependency
):
    tool = (
        db.query(Tools)
        .filter(
            Tools.id == id,
            Tools.created_by == user.id
        )
        .first()
    )

    if not tool:
        raise HTTPException(
            status_code=404,
            detail="Tool not found"
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
            detail="Knowledge base article not found"
        )

    if knowledge_base in tool.knowledge_base:
        return {
            "message": "Knowledge base article already associated with tool"
        }

    tool.knowledge_base.append(knowledge_base)

    db.commit()

    return {
        "message": "Knowledge base article added to tool"
    }


@router.delete("/{id}/knowledge-base/{knowledge_base_id}")
async def remove_tool_knowledge_base(
    user: user_dependency,
    id: int,
    knowledge_base_id: int,
    db: db_dependency
):
    tool = (
        db.query(Tools)
        .filter(
            Tools.id == id,
            Tools.created_by == user.id
        )
        .first()
    )

    if not tool:
        raise HTTPException(
            status_code=404,
            detail="Tool not found"
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
            detail="Knowledge base article not found"
        )

    if knowledge_base not in tool.knowledge_base:
        raise HTTPException(
            status_code=404,
            detail="Knowledge base article is not associated with this tool"
        )

    tool.knowledge_base.remove(knowledge_base)

    db.commit()

    return {
        "message": "Knowledge base article removed from tool"
    }


# ============================================================
# TOOL ↔ TROUBLESHOOTING TEMPLATES
# ============================================================

@router.get("/{id}/troubleshooting-templates")
async def get_tool_troubleshooting_templates(
    user: user_dependency,
    id: int,
    db: db_dependency
):
    tool = (
        db.query(Tools)
        .filter(
            Tools.id == id,
            Tools.created_by == user.id
        )
        .first()
    )

    if not tool:
        raise HTTPException(
            status_code=404,
            detail="Tool not found"
        )

    return tool.troubleshooting_templates


@router.post("/{id}/troubleshooting-templates/{template_id}")
async def add_tool_troubleshooting_template(
    user: user_dependency,
    id: int,
    template_id: int,
    db: db_dependency
):
    tool = (
        db.query(Tools)
        .filter(
            Tools.id == id,
            Tools.created_by == user.id
        )
        .first()
    )

    if not tool:
        raise HTTPException(
            status_code=404,
            detail="Tool not found"
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

    if template in tool.troubleshooting_templates:
        return {
            "message": "Troubleshooting template already associated with tool"
        }

    tool.troubleshooting_templates.append(template)

    db.commit()

    return {
        "message": "Troubleshooting template added to tool"
    }


@router.delete("/{id}/troubleshooting-templates/{template_id}")
async def remove_tool_troubleshooting_template(
    user: user_dependency,
    id: int,
    template_id: int,
    db: db_dependency
):
    tool = (
        db.query(Tools)
        .filter(
            Tools.id == id,
            Tools.created_by == user.id
        )
        .first()
    )

    if not tool:
        raise HTTPException(
            status_code=404,
            detail="Tool not found"
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

    if template not in tool.troubleshooting_templates:
        raise HTTPException(
            status_code=404,
            detail="Troubleshooting template is not associated with this tool"
        )

    tool.troubleshooting_templates.remove(template)

    db.commit()

    return {
        "message": "Troubleshooting template removed from tool"
    }


# ============================================================
# CREATE TOOL
# ============================================================

@router.post("/", response_model=ToolResponse, status_code=201)
async def create_tool(
    tool: ToolCreate,
    user: user_dependency,
    db: db_dependency
):
    new_tool = Tools(
        **tool.model_dump(),
        created_by=user.id
    )

    db.add(new_tool)
    db.commit()
    db.refresh(new_tool)

    return new_tool


# ============================================================
# UPDATE TOOL
# ============================================================

@router.put("/{id}", response_model=ToolResponse)
async def edit_tool(
    id: int,
    tool: ToolUpdate,
    user: user_dependency,
    db: db_dependency
):
    existing_tool = (
        db.query(Tools)
        .filter(
            Tools.id == id,
            Tools.created_by == user.id
        )
        .first()
    )

    if not existing_tool:
        raise HTTPException(
            status_code=404,
            detail="Tool not found"
        )

    update_data = tool.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(existing_tool, key, value)

    db.commit()
    db.refresh(existing_tool)

    return existing_tool


# ============================================================
# DELETE TOOL
# ============================================================

@router.delete("/{id}")
async def delete_tool(
    id: int,
    user: user_dependency,
    db: db_dependency
):
    existing_tool = (
        db.query(Tools)
        .filter(
            Tools.id == id,
            Tools.created_by == user.id
        )
        .first()
    )

    if not existing_tool:
        raise HTTPException(
            status_code=404,
            detail="Tool not found"
        )

    db.delete(existing_tool)
    db.commit()

    return {
        "message": "Tool deleted successfully"
    }