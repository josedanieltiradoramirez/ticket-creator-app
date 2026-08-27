from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Annotated

from app.core.database import get_db
from app.models.issue_types import IssueTypes
from app.models.troubleshooting_templates import TroubleshootingTemplates
from app.models.users import Users
from app.routers.auth import get_current_user

from app.schemas.troubleshooting_templates import TroubleshootingTemplateCreate, TroubleshootingTemplateUpdate, TroubleshootingTemplateResponse, TroubleshootingTemplateDetailResponse

from sqlalchemy.orm import selectinload

router = APIRouter(
    prefix='/troubleshooting_templates',
    tags=['troubleshooting_templates']) 


db_dependency = Annotated[Session, Depends(get_db)]
user_dependency = Annotated[Users, Depends(get_current_user)]
    
@router.get("/", response_model=List[TroubleshootingTemplateDetailResponse])
async def get_all_troubleshooting_templates(user : user_dependency, db: db_dependency):
    troubleshooting_templates = db.query(TroubleshootingTemplates).filter(TroubleshootingTemplates.created_by == user.id).all()
    return troubleshooting_templates

@router.get("/{id}", response_model=TroubleshootingTemplateResponse)
async def get_troubleshooting_template_by_id(user : user_dependency, id: int, db: db_dependency):
    
    troubleshooting_template = (
                db.query(TroubleshootingTemplates)
                .options(
                    selectinload(TroubleshootingTemplates.issue_types),
                    selectinload(TroubleshootingTemplates.knowledge_base),
                    selectinload(TroubleshootingTemplates.tools),
                )
                .filter(
                    TroubleshootingTemplates.id == id,
                    TroubleshootingTemplates.created_by == user.id
                )
                .first()
            )
    if not troubleshooting_template:
        raise HTTPException(status_code=404, detail="Troubleshooting template not found")
    return troubleshooting_template

@router.post("/", response_model=TroubleshootingTemplateResponse, status_code=201)
async def create_troubleshooting_template(user : user_dependency, troubleshooting_template: TroubleshootingTemplateCreate, db: db_dependency):
    troubleshooting_template_data = troubleshooting_template.model_dump()
    new_troubleshooting_template = TroubleshootingTemplates(**troubleshooting_template_data, created_by=user.id)
    db.add(new_troubleshooting_template)
    db.commit()
    db.refresh(new_troubleshooting_template)
    return new_troubleshooting_template



@router.put("/{id}", response_model=TroubleshootingTemplateResponse)
async def edit_troubleshooting_template(user: user_dependency, id: int, troubleshooting_template: TroubleshootingTemplateUpdate, db: db_dependency):
    existing_troubleshooting_template = db.query(TroubleshootingTemplates).filter(TroubleshootingTemplates.id == id, TroubleshootingTemplates.created_by == user.id).first()
    if not existing_troubleshooting_template:
        raise HTTPException(status_code=404, detail="Troubleshooting template not found")
    existing_troubleshooting_template.name = troubleshooting_template.name
    existing_troubleshooting_template.steps = troubleshooting_template.steps
    existing_troubleshooting_template.generated_description = troubleshooting_template.generated_description
    existing_troubleshooting_template.is_active = troubleshooting_template.is_active

    issue_types = (
        db.query(IssueTypes)
        .filter(
            IssueTypes.id.in_(troubleshooting_template.issue_types),
            IssueTypes.created_by == user.id
        )
        .all()
    )

    existing_troubleshooting_template.issue_types = issue_types
    
    db.commit()
    db.refresh(existing_troubleshooting_template)
    return existing_troubleshooting_template

@router.delete("/{id}")
async def delete_troubleshooting_template(user: user_dependency, id: int, db: db_dependency):
    troubleshooting_template = db.query(TroubleshootingTemplates).filter(TroubleshootingTemplates.id == id, TroubleshootingTemplates.created_by == user.id).first()
    if not troubleshooting_template:
        raise HTTPException(status_code=404, detail="Troubleshooting template not found")
    db.delete(troubleshooting_template)
    db.commit()
    
    return {
        "message": "Troubleshooting template deleted successfully"
    }
    