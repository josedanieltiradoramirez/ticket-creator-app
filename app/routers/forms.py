from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Annotated

from app.core.database import get_db
from app.models.forms import Forms
from app.models.users import Users
from app.routers.auth import get_current_user

from app.schemas.tickets import TicketCreate, TicketUpdate, TicketResponse



router = APIRouter(
    prefix='/forms',
    tags=['forms']) 


db_dependency = Annotated[Session, Depends(get_db)]
user_dependency = Annotated[Users, Depends(get_current_user)]
    
@router.get("/", response_model=List[TicketResponse])
async def get_all_forms(user : user_dependency, db: db_dependency):
    forms = db.query(Forms).filter(Forms.created_by == user.id).all()
    return forms

@router.get("/{id}", response_model=TicketResponse)
async def get_form_by_id(user : user_dependency, id: int, db: db_dependency):
    form = db.query(Forms).filter(Forms.id == id, Forms.created_by == user.id).first()
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")
    return form

@router.post("/", response_model=TicketResponse, status_code=201)
async def create_form(user : user_dependency, form: TicketCreate, db: db_dependency):
    form_data = form.model_dump()
    new_form = Forms(**form_data, created_by=user.id)
    db.add(new_form)
    db.commit()
    db.refresh(new_form)
    return new_form



@router.put("/{id}", response_model=TicketResponse)
async def edit_form(user: user_dependency, id: int, form: TicketUpdate, db: db_dependency):
    existing_form = db.query(Forms).filter(Forms.id == id, Forms.created_by == user.id).first()
    if not existing_form:
        raise HTTPException(status_code=404, detail="Form not found")
    form_data = form.model_dump()
    for key, value in form_data.items():
        setattr(existing_form, key, value)
    
    db.commit()
    db.refresh(existing_form)
    return existing_form

@router.delete("/{id}")
async def delete_form(user: user_dependency, id: int, db: db_dependency):
    form = db.query(Forms).filter(Forms.id == id, Forms.created_by == user.id).first()
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")
    db.delete(form)
    db.commit()
    
    return {
        "message": "Form deleted successfully"
    }
    