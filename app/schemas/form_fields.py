from pydantic import BaseModel, ConfigDict
from app.schemas.summaries import (
    FormSummary
)

class FormFieldCreate(BaseModel):
    form_id: int
    label: str
    field_type: str
    required: bool
    display_order: int

class FormFieldUpdate(BaseModel):
    form_id: int
    label: str
    field_type: str
    required: bool
    display_order: int

class FormFieldResponse(BaseModel):
    id: int
    form_id: int
    label: str
    field_type: str
    required: bool
    display_order: int

    model_config = ConfigDict(from_attributes=True)
    
class FormFieldDetailResponse(FormFieldResponse):
    form: FormSummary

