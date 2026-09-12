from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, selectinload
from typing import Annotated

from app.core.database import get_db

from app.models.issue_types import IssueTypes
from app.models.troubleshooting_templates import TroubleshootingTemplates
from app.models.tools import Tools
from app.models.tickets import Tickets
from app.models.knowledge_base import KnowledgeBase
from app.models.users import Users

from app.routers.auth import get_current_user

from app.schemas.knowledge_base import (
    KnowledgeBaseItemCreate,
    KnowledgeBaseItemUpdate,
    KnowledgeBaseItemResponse,
    KnowledgeBaseDetailResponse
)


router = APIRouter(
    prefix="/knowledge_base",
    tags=["knowledge_base"]
)


db_dependency = Annotated[Session, Depends(get_db)]
user_dependency = Annotated[Users, Depends(get_current_user)]


# ============================================================
# GET ALL KNOWLEDGE BASE ITEMS
# ============================================================

@router.get(
    "/",
    response_model=List[KnowledgeBaseItemResponse]
)
async def get_all_knowledge_base_items(
    user: user_dependency,
    db: db_dependency
):

    knowledge_base_items = (
        db.query(KnowledgeBase)
        .filter(
            KnowledgeBase.created_by == user.id
        )
        .all()
    )

    return knowledge_base_items


# ============================================================
# GET KNOWLEDGE BASE ITEM BY ID
# ============================================================

@router.get(
    "/{id}",
    response_model=KnowledgeBaseDetailResponse
)
async def get_knowledge_base_item_by_id(
    user: user_dependency,
    id: int,
    db: db_dependency
):

    knowledge_base_item = (
        db.query(KnowledgeBase)
        .options(
            selectinload(KnowledgeBase.issue_types),
            selectinload(KnowledgeBase.tools),
            selectinload(
                KnowledgeBase.troubleshooting_templates
            ),
            selectinload(KnowledgeBase.tickets)
        )
        .filter(
            KnowledgeBase.id == id,
            KnowledgeBase.created_by == user.id
        )
        .first()
    )

    if not knowledge_base_item:

        raise HTTPException(
            status_code=404,
            detail="Knowledge base item not found"
        )

    return knowledge_base_item


# ============================================================
# TOOLS
# ============================================================

@router.get("/{id}/tools")
async def get_knowledge_base_tools(
    user: user_dependency,
    id: int,
    db: db_dependency
):

    knowledge_base_item = (
        db.query(KnowledgeBase)
        .options(
            selectinload(KnowledgeBase.tools)
        )
        .filter(
            KnowledgeBase.id == id,
            KnowledgeBase.created_by == user.id
        )
        .first()
    )

    if not knowledge_base_item:

        raise HTTPException(
            status_code=404,
            detail="Knowledge base item not found"
        )

    return knowledge_base_item.tools


@router.post("/{id}/tools/{tool_id}")
async def add_tool_to_knowledge_base(
    user: user_dependency,
    id: int,
    tool_id: int,
    db: db_dependency
):

    knowledge_base_item = (
        db.query(KnowledgeBase)
        .filter(
            KnowledgeBase.id == id,
            KnowledgeBase.created_by == user.id
        )
        .first()
    )

    if not knowledge_base_item:

        raise HTTPException(
            status_code=404,
            detail="Knowledge base item not found"
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

    if tool not in knowledge_base_item.tools:

        knowledge_base_item.tools.append(tool)

    db.commit()

    return {
        "message": "Tool added successfully"
    }


@router.delete("/{id}/tools/{tool_id}")
async def remove_tool_from_knowledge_base(
    user: user_dependency,
    id: int,
    tool_id: int,
    db: db_dependency
):

    knowledge_base_item = (
        db.query(KnowledgeBase)
        .filter(
            KnowledgeBase.id == id,
            KnowledgeBase.created_by == user.id
        )
        .first()
    )

    if not knowledge_base_item:

        raise HTTPException(
            status_code=404,
            detail="Knowledge base item not found"
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

    if tool in knowledge_base_item.tools:

        knowledge_base_item.tools.remove(tool)

    db.commit()

    return {
        "message": "Tool removed successfully"
    }


# ============================================================
# TROUBLESHOOTING TEMPLATES
# ============================================================

@router.get("/{id}/troubleshooting-templates")
async def get_knowledge_base_troubleshooting_templates(
    user: user_dependency,
    id: int,
    db: db_dependency
):

    knowledge_base_item = (
        db.query(KnowledgeBase)
        .options(
            selectinload(
                KnowledgeBase.troubleshooting_templates
            )
        )
        .filter(
            KnowledgeBase.id == id,
            KnowledgeBase.created_by == user.id
        )
        .first()
    )

    if not knowledge_base_item:

        raise HTTPException(
            status_code=404,
            detail="Knowledge base item not found"
        )

    return knowledge_base_item.troubleshooting_templates


@router.post("/{id}/troubleshooting-templates/{template_id}")
async def add_troubleshooting_template_to_knowledge_base(
    user: user_dependency,
    id: int,
    template_id: int,
    db: db_dependency
):

    knowledge_base_item = (
        db.query(KnowledgeBase)
        .filter(
            KnowledgeBase.id == id,
            KnowledgeBase.created_by == user.id
        )
        .first()
    )

    if not knowledge_base_item:

        raise HTTPException(
            status_code=404,
            detail="Knowledge base item not found"
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

    if template not in knowledge_base_item.troubleshooting_templates:

        knowledge_base_item.troubleshooting_templates.append(
            template
        )

    db.commit()

    return {
        "message": "Troubleshooting template added successfully"
    }


@router.delete("/{id}/troubleshooting-templates/{template_id}")
async def remove_troubleshooting_template_from_knowledge_base(
    user: user_dependency,
    id: int,
    template_id: int,
    db: db_dependency
):

    knowledge_base_item = (
        db.query(KnowledgeBase)
        .filter(
            KnowledgeBase.id == id,
            KnowledgeBase.created_by == user.id
        )
        .first()
    )

    if not knowledge_base_item:

        raise HTTPException(
            status_code=404,
            detail="Knowledge base item not found"
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

    if template in knowledge_base_item.troubleshooting_templates:

        knowledge_base_item.troubleshooting_templates.remove(
            template
        )

    db.commit()

    return {
        "message": "Troubleshooting template removed successfully"
    }


# ============================================================
# ISSUE TYPES
# ============================================================

@router.get("/{id}/issue-types")
async def get_knowledge_base_issue_types(
    user: user_dependency,
    id: int,
    db: db_dependency
):

    knowledge_base_item = (
        db.query(KnowledgeBase)
        .options(
            selectinload(KnowledgeBase.issue_types)
        )
        .filter(
            KnowledgeBase.id == id,
            KnowledgeBase.created_by == user.id
        )
        .first()
    )

    if not knowledge_base_item:

        raise HTTPException(
            status_code=404,
            detail="Knowledge base item not found"
        )

    return knowledge_base_item.issue_types


@router.post("/{id}/issue-types/{issue_type_id}")
async def add_issue_type_to_knowledge_base(
    user: user_dependency,
    id: int,
    issue_type_id: int,
    db: db_dependency
):

    knowledge_base_item = (
        db.query(KnowledgeBase)
        .filter(
            KnowledgeBase.id == id,
            KnowledgeBase.created_by == user.id
        )
        .first()
    )

    if not knowledge_base_item:

        raise HTTPException(
            status_code=404,
            detail="Knowledge base item not found"
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

    if issue_type not in knowledge_base_item.issue_types:

        knowledge_base_item.issue_types.append(
            issue_type
        )

    db.commit()

    return {
        "message": "Issue Type added successfully"
    }


@router.delete("/{id}/issue-types/{issue_type_id}")
async def remove_issue_type_from_knowledge_base(
    user: user_dependency,
    id: int,
    issue_type_id: int,
    db: db_dependency
):

    knowledge_base_item = (
        db.query(KnowledgeBase)
        .filter(
            KnowledgeBase.id == id,
            KnowledgeBase.created_by == user.id
        )
        .first()
    )

    if not knowledge_base_item:

        raise HTTPException(
            status_code=404,
            detail="Knowledge base item not found"
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

    if issue_type in knowledge_base_item.issue_types:

        knowledge_base_item.issue_types.remove(
            issue_type
        )

    db.commit()

    return {
        "message": "Issue Type removed successfully"
    }


# ============================================================
# CREATE
# ============================================================

@router.post(
    "/",
    response_model=KnowledgeBaseItemResponse,
    status_code=201
)
async def create_knowledge_base_item(
    user: user_dependency,
    knowledge_base_item: KnowledgeBaseItemCreate,
    db: db_dependency
):

    knowledge_base_data = knowledge_base_item.model_dump()

    new_knowledge_base_item = KnowledgeBase(
        **knowledge_base_data,
        created_by=user.id
    )

    db.add(new_knowledge_base_item)

    db.commit()

    db.refresh(new_knowledge_base_item)

    return new_knowledge_base_item


# ============================================================
# UPDATE
# ============================================================

@router.put(
    "/{id}",
    response_model=KnowledgeBaseItemResponse
)
async def edit_knowledge_base_item(
    user: user_dependency,
    id: int,
    knowledge_base_item: KnowledgeBaseItemUpdate,
    db: db_dependency
):

    existing_knowledge_base_item = (
        db.query(KnowledgeBase)
        .filter(
            KnowledgeBase.id == id,
            KnowledgeBase.created_by == user.id
        )
        .first()
    )

    if not existing_knowledge_base_item:

        raise HTTPException(
            status_code=404,
            detail="Knowledge base item not found"
        )

    if knowledge_base_item.article_number is not None:

        existing_knowledge_base_item.article_number = (
            knowledge_base_item.article_number
        )

    if knowledge_base_item.title is not None:

        existing_knowledge_base_item.title = (
            knowledge_base_item.title
        )

    if knowledge_base_item.url is not None:

        existing_knowledge_base_item.url = (
            knowledge_base_item.url
        )

    if knowledge_base_item.description is not None:

        existing_knowledge_base_item.description = (
            knowledge_base_item.description
        )


    if knowledge_base_item.issue_types is not None:

        issue_types = (
            db.query(IssueTypes)
            .filter(
                IssueTypes.id.in_(
                    knowledge_base_item.issue_types
                ),
                IssueTypes.created_by == user.id
            )
            .all()
        )

        existing_knowledge_base_item.issue_types = (
            issue_types
        )


    if knowledge_base_item.troubleshooting_templates is not None:

        troubleshooting_templates = (
            db.query(TroubleshootingTemplates)
            .filter(
                TroubleshootingTemplates.id.in_(
                    knowledge_base_item.troubleshooting_templates
                ),
                TroubleshootingTemplates.created_by == user.id
            )
            .all()
        )

        existing_knowledge_base_item.troubleshooting_templates = (
            troubleshooting_templates
        )


    if knowledge_base_item.tools is not None:

        tools = (
            db.query(Tools)
            .filter(
                Tools.id.in_(
                    knowledge_base_item.tools
                ),
                Tools.created_by == user.id
            )
            .all()
        )

        existing_knowledge_base_item.tools = tools


    if knowledge_base_item.tickets is not None:

        tickets = (
            db.query(Tickets)
            .filter(
                Tickets.id.in_(
                    knowledge_base_item.tickets
                ),
                Tickets.created_by == user.id
            )
            .all()
        )

        existing_knowledge_base_item.tickets = tickets


    db.commit()

    db.refresh(existing_knowledge_base_item)

    return existing_knowledge_base_item


# ============================================================
# DELETE
# ============================================================

@router.delete("/{id}")
async def delete_knowledge_base_item(
    user: user_dependency,
    id: int,
    db: db_dependency
):

    knowledge_base_item = (
        db.query(KnowledgeBase)
        .filter(
            KnowledgeBase.id == id,
            KnowledgeBase.created_by == user.id
        )
        .first()
    )

    if not knowledge_base_item:

        raise HTTPException(
            status_code=404,
            detail="Knowledge base item not found"
        )

    db.delete(knowledge_base_item)

    db.commit()

    return {
        "message": "Knowledge base item deleted successfully"
    }