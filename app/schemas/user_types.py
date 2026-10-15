from pydantic import BaseModel, ConfigDict


class UserTypeCreate(BaseModel):
    name: str
    is_active: bool = True


class UserTypeUpdate(BaseModel):
    name: str | None = None
    is_active: bool | None = None


class UserTypeResponse(BaseModel):
    id: int
    name: str
    is_active: bool

    model_config = ConfigDict(from_attributes=True)