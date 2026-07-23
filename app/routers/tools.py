from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Annotated

from app.core.database import get_db
from app.models.tools import Tools
from app.models.users import Users
from app.routers.auth import get_current_user

from app.schemas.tools import ToolCreate, ToolUpdate, ToolResponse



router = APIRouter(
    prefix='/tools',
    tags=['tools']) 


db_dependency = Annotated[Session, Depends(get_db)]
user_dependency = Annotated[Users, Depends(get_current_user)]
    
@router.get("/", response_model=List[ToolResponse])
async def get_all_tools(user : user_dependency, db: db_dependency):
    tools = db.query(Tools).filter(Tools.created_by == user.id).all()
    return tools

@router.get("/{id}", response_model=ToolResponse)
async def get_tool_by_id(user : user_dependency, id: int, db: db_dependency):
    tool = db.query(Tools).filter(Tools.id == id, Tools.created_by == user.id).first()
    if not tool:
        raise HTTPException(status_code=404, detail="Tool not found")
    return tool

@router.post("/", response_model=ToolResponse, status_code=201)
async def create_tool(user : user_dependency, tool: ToolCreate, db: db_dependency):
    tool_data = tool.model_dump()
    new_tool = Tools(**tool_data, created_by=user.id)
    db.add(new_tool)
    db.commit()
    db.refresh(new_tool)
    return new_tool



@router.put("/{id}", response_model=ToolResponse)
async def edit_tool(user: user_dependency, id: int, tool: ToolUpdate, db: db_dependency):
    existing_tool = db.query(Tools).filter(Tools.id == id, Tools.created_by == user.id).first()
    if not existing_tool:
        raise HTTPException(status_code=404, detail="Tool not found")
    tool_data = tool.model_dump()
    for key, value in tool_data.items():
        setattr(existing_tool, key, value)
    
    db.commit()
    db.refresh(existing_tool)
    return existing_tool
    

@router.delete("/{id}")
async def delete_tool(user: user_dependency, id: int, db: db_dependency):
    tool = db.query(Tools).filter(Tools.id == id, Tools.created_by == user.id).first()
    if not tool:
        raise HTTPException(status_code=404, detail="Tool not found")
    db.delete(tool)
    db.commit()
    
    return {
        "message": "Tool deleted successfully"
    }
    