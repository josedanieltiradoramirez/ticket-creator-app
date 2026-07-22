from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Annotated

from app.core.database import get_db
from app.models.forms import Forms
from app.models.form_fields import FormFields
from app.models.users import Users
from app.routers.auth import get_current_user

from app.schemas.tickets import TicketCreate, TicketUpdate, TicketResponse



router = APIRouter(
    prefix='/form_fields',
    tags=['form_fields']) 


db_dependency = Annotated[Session, Depends(get_db)]
user_dependency = Annotated[Users, Depends(get_current_user)]
    
@router.get("/", response_model=List[TicketResponse])
async def get_all_form_fields(user : user_dependency, db: db_dependency):
    form_fields = db.query(FormFields).filter(FormFields.created_by == user.id).all()
    return form_fields

@router.get("/{id}", response_model=TicketResponse)
async def get_form_field_by_id(user : user_dependency, id: int, db: db_dependency):
    form_field = db.query(FormFields).filter(FormFields.id == id, FormFields.created_by == user.id).first()
    if not form_field:
        raise HTTPException(status_code=404, detail="Form field not found")
    return form_field

@router.post("/", response_model=TicketResponse, status_code=201)
async def create_form_field(user : user_dependency, form_field: TicketCreate, db: db_dependency):
    form_field_data = form_field.model_dump()
    new_form_field = FormFields(**form_field_data, created_by=user.id)
    db.add(new_form_field)
    db.commit()
    db.refresh(new_form_field)
    return new_form_field



@router.put("/{id}", response_model=TicketResponse)
async def edit_form_field(user: user_dependency, id: int, form_field: TicketUpdate, db: db_dependency):
    existing_form_field = db.query(FormFields).filter(FormFields.id == id, FormFields.created_by == user.id).first()
    if not existing_form_field:
        raise HTTPException(status_code=404, detail="Form field not found")
    form_field_data = form_field.model_dump()
    for key, value in form_field_data.items():
        setattr(existing_form_field, key, value)
    
    db.commit()
    db.refresh(existing_form_field)
    return existing_form_field

@router.delete("/{id}")
async def delete_form_field(user: user_dependency, id: int, db: db_dependency):
    form_field = db.query(FormFields).filter(FormFields.id == id, FormFields.created_by == user.id).first()
    if not form_field:
        raise HTTPException(status_code=404, detail="Form field not found")
    db.delete(form_field)
    db.commit()
    
    return {
        "message": "Form field deleted successfully"
    }
    