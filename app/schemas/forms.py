from pydantic import BaseModel, ConfigDict

from app.schemas.summaries import (
    FormFieldSummary,
    IssueTypeSummary
)

class FormCreate(BaseModel):
    name: str
    description: str
    is_active: bool

class FormUpdate(BaseModel):
    name: str
    description: str
    is_active: bool

class FormResponse(BaseModel):
    id: int
    name: str
    description: str
    is_active: bool

    model_config = ConfigDict(from_attributes=True)

class FormDetailResponse(FormResponse):
    form_fields: list[FormFieldSummary]
    issue_types: list[IssueTypeSummary]