import app.models

import os
import hmac
from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse, FileResponse, JSONResponse
from pathlib import Path
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.routers import auth, form_fields, forms, issue_types, knowledge_base, locations, priorities, queues, ticket_status, tickets, tools, troubleshooting_templates, user_types, users, warehouse_management_systems, knowledge_base_notes

## from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from app.core.database import engine
from app.core.database import Base


docs_enabled = os.getenv("ENABLE_API_DOCS", "false").strip().lower() in {"1", "true", "yes", "on"}
app = FastAPI(
    docs_url="/docs" if docs_enabled else None,
    redoc_url="/redoc" if docs_enabled else None,
    openapi_url="/openapi.json" if docs_enabled else None
)

FRONTEND_DIR = Path(__file__).resolve().parent.parent / "frontend"
CORS_ORIGINS = [
    origin.strip().rstrip("/")
    for origin in os.getenv(
        "CORS_ORIGINS",
        "http://127.0.0.1:5500,http://localhost:5500,http://127.0.0.1:8000,http://localhost:8000"
    ).split(",")
    if origin.strip()
]

if "*" in CORS_ORIGINS:
    raise RuntimeError("CORS_ORIGINS must list explicit origins; wildcard origins are not allowed.")

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "X-CSRF-Token"],
    allow_credentials=True,
)


@app.middleware("http")
async def protect_cookie_authenticated_writes(request: Request, call_next):
    if (
        request.method.upper() in {"POST", "PUT", "PATCH", "DELETE"}
        and request.cookies.get("access_token")
    ):
        cookie_token = request.cookies.get("csrf_token", "")
        header_token = request.headers.get("x-csrf-token", "")
        if (
            not cookie_token
            or not header_token
            or not hmac.compare_digest(
                cookie_token.encode("utf-8"),
                header_token.encode("utf-8")
            )
        ):
            return JSONResponse(
                status_code=403,
                content={"detail": "CSRF validation failed."}
            )
    return await call_next(request)

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
