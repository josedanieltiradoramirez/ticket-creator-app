import app.models

from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse, FileResponse
from pathlib import Path
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.routers import auth, form_fields, forms, issue_types, knowledge_base, locations, priorities, queues, ticket_status, tickets, tools, troubleshooting_templates, user_types, users, warehouse_management_systems, knowledge_base_notes

## from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from app.core.database import engine
from app.core.database import Base


app = FastAPI()

FRONTEND_DIR = Path(__file__).resolve().parent.parent / "frontend"

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
app.include_router(warehouse_management_systems.router, prefix="/api")
app.include_router(knowledge_base_notes.router, prefix="/api")
app.include_router(user_types.router, prefix="/api")


@app.get("/")
async def serve_index():
    return FileResponse(FRONTEND_DIR / "index.html")


@app.get("/{file_path:path}")
async def serve_frontend(file_path: str):
    file_path = FRONTEND_DIR / file_path

    if file_path.exists() and file_path.is_file():
        return FileResponse(file_path)

    raise HTTPException(status_code=404, detail="File not found")