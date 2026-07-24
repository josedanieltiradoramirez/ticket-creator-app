from pydantic import BaseModel

class ToolSummary(BaseModel):
    id: int
    name: str

    class Config:
        orm_mode = True


class IssueTypeSummary(BaseModel):
    id: int
    name: str

    class Config:
        orm_mode = True


class KnowledgeBaseSummary(BaseModel):
    id: int
    article_number: str
    title: str

    class Config:
        orm_mode = True


class TroubleshootingTemplateSummary(BaseModel):
    id: int
    generated_description: str

    class Config:
        orm_mode = True


class FormSummary(BaseModel):
    id: int
    name: str

    class Config:
        orm_mode = True

class FormFieldSummary(BaseModel):
    id: int
    name: str

    class Config:
        orm_mode = True


class QueueSummary(BaseModel):
    id: int
    name: str

    class Config:
        orm_mode = True

class TicketStatusSummary(BaseModel):
    id: int
    name: str

    class Config:
        orm_mode = True

class LocationSummary(BaseModel):
    id: int
    name: str
    code: str

    class Config:
        orm_mode = True

class PrioritySummary(BaseModel):
    id: int
    name: str
        
    class Config:
        orm_mode = True