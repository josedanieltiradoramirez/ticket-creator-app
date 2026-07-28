from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Annotated

from app.core.database import get_db
from app.models.warehouse_management_systems import WarehouseManagementSystems
from app.models.users import Users
from app.routers.auth import get_current_user

from app.schemas.warehouse_management_systems import WarehouseManagementSystemCreate, WarehouseManagementSystemUpdate, WarehouseManagementSystemResponse



router = APIRouter(
    prefix='/warehouse_management_systems',
    tags=['warehouse_management_systems']) 


db_dependency = Annotated[Session, Depends(get_db)]
user_dependency = Annotated[Users, Depends(get_current_user)]
    
@router.get("/", response_model=List[WarehouseManagementSystemResponse])
async def get_all_warehouse_management_systems(user : user_dependency, db: db_dependency):
    warehouse_management_systems = db.query(WarehouseManagementSystems).filter(WarehouseManagementSystems.created_by == user.id).all()
    return warehouse_management_systems

@router.get("/{id}", response_model=WarehouseManagementSystemResponse)
async def get_warehouse_management_system_by_id(user : user_dependency, id: int, db: db_dependency):
    warehouse_management_system = db.query(WarehouseManagementSystems).filter(WarehouseManagementSystems.id == id, WarehouseManagementSystems.created_by == user.id).first()
    if not warehouse_management_system:
        raise HTTPException(status_code=404, detail="Warehouse Management System not found")
    return warehouse_management_system

@router.post("/", response_model=WarehouseManagementSystemResponse, status_code=201)
async def create_warehouse_management_system(user : user_dependency, warehouse_management_system: WarehouseManagementSystemCreate, db: db_dependency):
    warehouse_management_system_data = warehouse_management_system.model_dump()
    new_warehouse_management_system = WarehouseManagementSystems(**warehouse_management_system_data, created_by=user.id)
    db.add(new_warehouse_management_system)
    db.commit()
    db.refresh(new_warehouse_management_system)
    return new_warehouse_management_system



@router.put("/{id}", response_model=WarehouseManagementSystemResponse)
async def edit_warehouse_management_system(user: user_dependency, id: int, warehouse_management_system: WarehouseManagementSystemUpdate, db: db_dependency):
    existing_warehouse_management_system = db.query(WarehouseManagementSystems).filter(WarehouseManagementSystems.id == id, WarehouseManagementSystems.created_by == user.id).first()
    if not existing_warehouse_management_system:
        raise HTTPException(status_code=404, detail="Warehouse Management System not found")
    warehouse_management_system_data = warehouse_management_system.model_dump()
    for key, value in warehouse_management_system_data.items():
        setattr(existing_warehouse_management_system, key, value)
    
    db.commit()
    db.refresh(existing_warehouse_management_system)
    return existing_warehouse_management_system
    
@router.delete("/{id}")
async def delete_warehouse_management_system(user: user_dependency, id: int, db: db_dependency):
    warehouse_management_system = db.query(WarehouseManagementSystems).filter(WarehouseManagementSystems.id == id, WarehouseManagementSystems.created_by == user.id).first()
    if not warehouse_management_system:
        raise HTTPException(status_code=404, detail="Warehouse Management System not found")
    db.delete(warehouse_management_system)
    db.commit()
    
    return {
        "message": "Warehouse Management System deleted successfully"
    }
    