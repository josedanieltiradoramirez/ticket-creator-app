from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.routers import auth, form_fields, forms, issue_types, knowledge_base, locations, priorities, queues, ticket_status, tickets, tools, troubleshooting_templates, users

## from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from app.core.database import engine
from app.core.database import Base


app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(tickets.router, prefix="/api")
app.include_router(users.router, prefix="/api")
app.include_router(auth.router, prefix="/api")
app.include_router(form_fields.router, prefix="/api")
app.include_router(forms.router, prefix="/api")
app.include_router(issue_types.router, prefix="/api")
app.include_router(knowledge_base.router, prefix="/api")
app.include_router(locations.router, prefix="/api")
app.include_router(priorities.router, prefix="/api")
app.include_router(queues.router, prefix="/api")
app.include_router(ticket_status.router, prefix="/api")
app.include_router(tools.router, prefix="/api")
app.include_router(troubleshooting_templates.router, prefix="/api")


