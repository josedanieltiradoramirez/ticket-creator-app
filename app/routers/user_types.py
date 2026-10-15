from typing import Annotated, List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.user_types import UserTypes
from app.models.users import Users
from app.routers.auth import get_current_user
from app.schemas.user_types import (
    UserTypeCreate,
    UserTypeUpdate,
    UserTypeResponse
)


router = APIRouter(
    prefix="/user-types",
    tags=["user-types"]
)


db_dependency = Annotated[Session, Depends(get_db)]
user_dependency = Annotated[Users, Depends(get_current_user)]


@router.get("/", response_model=List[UserTypeResponse])
async def get_all_user_types(
    user: user_dependency,
    db: db_dependency
):
    user_types = (
        db.query(UserTypes)
        .filter(
            UserTypes.created_by == user.id,
            UserTypes.is_active == True
        )
        .all()
    )

    return user_types


@router.get("/{id}", response_model=UserTypeResponse)
async def get_user_type_by_id(
    user: user_dependency,
    id: int,
    db: db_dependency
):
    user_type = (
        db.query(UserTypes)
        .filter(
            UserTypes.id == id,
            UserTypes.created_by == user.id
        )
        .first()
    )

    if not user_type:
        raise HTTPException(
            status_code=404,
            detail="User Type not found"
        )

    return user_type


@router.post(
    "/",
    response_model=UserTypeResponse,
    status_code=201
)
async def create_user_type(
    user: user_dependency,
    user_type: UserTypeCreate,
    db: db_dependency
):
    existing_user_type = (
        db.query(UserTypes)
        .filter(
            UserTypes.name == user_type.name,
            UserTypes.created_by == user.id
        )
        .first()
    )

    if existing_user_type:
        return existing_user_type

    new_user_type = UserTypes(
        **user_type.model_dump(),
        created_by=user.id
    )

    db.add(new_user_type)
    db.commit()
    db.refresh(new_user_type)

    return new_user_type


@router.put(
    "/{id}",
    response_model=UserTypeResponse
)
async def edit_user_type(
    user: user_dependency,
    id: int,
    user_type: UserTypeUpdate,
    db: db_dependency
):
    existing_user_type = (
        db.query(UserTypes)
        .filter(
            UserTypes.id == id,
            UserTypes.created_by == user.id
        )
        .first()
    )

    if not existing_user_type:
        raise HTTPException(
            status_code=404,
            detail="User Type not found"
        )

    update_data = user_type.model_dump(
        exclude_unset=True
    )

    for key, value in update_data.items():
        setattr(existing_user_type, key, value)

    db.commit()
    db.refresh(existing_user_type)

    return existing_user_type


@router.delete("/{id}")
async def delete_user_type(
    user: user_dependency,
    id: int,
    db: db_dependency
):
    user_type = (
        db.query(UserTypes)
        .filter(
            UserTypes.id == id,
            UserTypes.created_by == user.id
        )
        .first()
    )

    if not user_type:
        raise HTTPException(
            status_code=404,
            detail="User Type not found"
        )

    db.delete(user_type)
    db.commit()

    return {
        "message": "User Type deleted successfully"
    }