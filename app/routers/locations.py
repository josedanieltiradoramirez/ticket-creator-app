from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Annotated

from app.core.database import get_db
from app.models.locations import Locations
from app.models.users import Users
from app.routers.auth import get_current_user

from app.schemas.tickets import TicketCreate, TicketUpdate, TicketResponse



router = APIRouter(
    prefix='/locations',
    tags=['locations']) 


db_dependency = Annotated[Session, Depends(get_db)]
user_dependency = Annotated[Users, Depends(get_current_user)]
    
@router.get("/", response_model=List[TicketResponse])
async def get_all_locations(user : user_dependency, db: db_dependency):
    locations = db.query(Locations).filter(Locations.created_by == user.id).all()
    return locations

@router.get("/{id}", response_model=TicketResponse)
async def get_location_by_id(user : user_dependency, id: int, db: db_dependency):
    location = db.query(Locations).filter(Locations.id == id, Locations.created_by == user.id).first()
    if not location:
        raise HTTPException(status_code=404, detail="Location not found")
    return location

@router.post("/", response_model=TicketResponse, status_code=201)
async def create_location(user : user_dependency, location: TicketCreate, db: db_dependency):
    location_data = location.model_dump()
    new_location = Locations(**location_data, created_by=user.id)
    db.add(new_location)
    db.commit()
    db.refresh(new_location)
    return new_location



@router.put("/{id}", response_model=TicketResponse)
async def edit_location(user: user_dependency, id: int, location: TicketUpdate, db: db_dependency):
    existing_location = db.query(Locations).filter(Locations.id == id, Locations.created_by == user.id).first()
    if not existing_location:
        raise HTTPException(status_code=404, detail="Location not found")
    location_data = location.model_dump()
    for key, value in location_data.items():
        setattr(existing_location, key, value)
    
    db.commit()
    db.refresh(existing_location)
    return existing_location
    
@router.delete("/{id}")
async def delete_location(user: user_dependency, id: int, db: db_dependency):
    location = db.query(Locations).filter(Locations.id == id, Locations.created_by == user.id).first()
    if not location:
        raise HTTPException(status_code=404, detail="Location not found")
    db.delete(location)
    db.commit()
    
    return {
        "message": "Location deleted successfully"
    }
    