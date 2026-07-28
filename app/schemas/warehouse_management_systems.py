from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

from app.schemas.summaries import (
    LocationSummary
)

class WarehouseManagementSystemCreate(BaseModel):
    name: str
    description: str

class WarehouseManagementSystemUpdate(BaseModel):
    name: str
    description: str

class WarehouseManagementSystemResponse(BaseModel):
    id: int
    name: str
    description: str


    model_config = ConfigDict(from_attributes=True)

class WarehouseManagementSystemDetailResponse(WarehouseManagementSystemResponse):
    locations: list[LocationSummary]