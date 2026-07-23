from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Annotated

from app.core.database import get_db
from app.models.issue_types import IssueTypes
from app.models.users import Users
from app.routers.auth import get_current_user

from app.schemas.issue_types import IssueTypeCreate, IssueTypeUpdate, IssueTypeResponse



router = APIRouter(
    prefix='/issue_types',
    tags=['issue_types']) 


db_dependency = Annotated[Session, Depends(get_db)]
user_dependency = Annotated[Users, Depends(get_current_user)]
    
@router.get("/", response_model=List[IssueTypeResponse])
async def get_all_issue_types(user : user_dependency, db: db_dependency):
    issue_types = db.query(IssueTypes).filter(IssueTypes.created_by == user.id).all()
    return issue_types

@router.get("/{id}", response_model=IssueTypeResponse)
async def get_issue_type_by_id(user : user_dependency, id: int, db: db_dependency):
    issue_type = db.query(IssueTypes).filter(IssueTypes.id == id, IssueTypes.created_by == user.id).first()
    if not issue_type:
        raise HTTPException(status_code=404, detail="Issue type not found")
    return issue_type

@router.post("/", response_model=IssueTypeResponse, status_code=201)
async def create_issue_type(user : user_dependency, issue_type: IssueTypeCreate, db: db_dependency):
    issue_type_data = issue_type.model_dump()
    new_issue_type = IssueTypes(**issue_type_data, created_by=user.id)
    db.add(new_issue_type)
    db.commit()
    db.refresh(new_issue_type)
    return new_issue_type



@router.put("/{id}", response_model=IssueTypeResponse)
async def edit_issue_type(user: user_dependency, id: int, issue_type: IssueTypeUpdate, db: db_dependency):
    existing_issue_type = db.query(IssueTypes).filter(IssueTypes.id == id, IssueTypes.created_by == user.id).first()
    if not existing_issue_type:
        raise HTTPException(status_code=404, detail="Issue type not found")
    issue_type_data = issue_type.model_dump()
    for key, value in issue_type_data.items():
        setattr(existing_issue_type, key, value)
    
    db.commit()
    db.refresh(existing_issue_type)
    return existing_issue_type

@router.delete("/{id}")
async def delete_issue_type(user: user_dependency, id: int, db: db_dependency):
    issue_type = db.query(IssueTypes).filter(IssueTypes.id == id, IssueTypes.created_by == user.id).first()
    if not issue_type:
        raise HTTPException(status_code=404, detail="Issue type not found")
    db.delete(issue_type)
    db.commit()
    
    return {
        "message": "Issue type deleted successfully"
    }
    