import os
import secrets

from fastapi import APIRouter, Depends, HTTPException, Request, Response
from pydantic import BaseModel, Field
from app.models.users import Users
from passlib.context import CryptContext
from sqlalchemy import or_
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from typing import Annotated
from starlette import status
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from jose import jwt
from datetime import timedelta, datetime, timezone
## from fastapi.templating import Jinja2Templates
from typing import Optional
from app.core.database import get_db


router = APIRouter(
    prefix='/auth',
    tags=['auth']
)

SECRET_KEY = os.getenv("SECRET_KEY", "").strip()
if len(SECRET_KEY) < 32 or SECRET_KEY == "CHANGE_ME":
    raise RuntimeError(
        "SECRET_KEY must be configured with at least 32 characters before starting the app."
    )

COOKIE_SECURE = os.getenv(
    "COOKIE_SECURE",
    "true"
).strip().lower() in {"1", "true", "yes", "on"}
ACCESS_TOKEN_MINUTES = 30
ALGORITHM = "HS256"


bcrypt_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_bearer = OAuth2PasswordBearer(
    tokenUrl="/api/auth/token",
    auto_error=False
)

class CreateUserRequest(BaseModel):
    username: str
    email: str
    first_name: str
    last_name: str
    password: str = Field(min_length=12)
    role: Optional[str] = "user"
    phone_number: Optional[str] = ""


class RegisterUserRequest(BaseModel):
    username: str = Field(min_length=3, max_length=64)
    email: str = Field(min_length=5, max_length=255)
    first_name: str = Field(min_length=1, max_length=100)
    last_name: str = Field(min_length=1, max_length=100)
    password: str = Field(min_length=12, max_length=72)

db_dependency = Annotated[Session, Depends(get_db)]

## templates = Jinja2Templates(directory="templates")


### Endpoints ###
@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register_user(
    registration: RegisterUserRequest,
    db: db_dependency
):
    username = registration.username.strip()
    email = registration.email.strip().lower()
    first_name = registration.first_name.strip()
    last_name = registration.last_name.strip()

    if not all((username, email, first_name, last_name)):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Please complete all required fields."
        )
    if len(registration.password.encode("utf-8")) > 72:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Password must be no longer than 72 UTF-8 bytes."
        )

    existing_user = db.query(Users).filter(
        or_(Users.username == username, Users.email == email)
    ).first()
    if existing_user:
        if existing_user.username == username:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="This username is already registered.")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="This email is already registered.")

    new_user = Users(
        username=username,
        email=email,
        first_name=first_name,
        last_name=last_name,
        role="user",
        hashed_password=bcrypt_context.hash(registration.password),
        is_active=True,
        phone_number=""
    )
    db.add(new_user)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="That username or email is already registered."
        )

    return {"message": "Account created. You can now sign in."}


def authenticate_user(username: str, password: str, db):
    user = db.query(Users).filter(
        or_(Users.username == username, Users.email == username)
    ).first()
    if not user:
        return False
    if not bcrypt_context.verify(password, user.hashed_password):
        return False
    return user

def create_access_token(username: str, user_id: int, role: str, expires_delta: timedelta):
    encode = {"sub": username, "id": user_id, 'role': role}
    expires = datetime.now(timezone.utc) + expires_delta
    encode.update({'exp': expires})
    return jwt.encode(encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(
    request: Request,
    token: Annotated[Optional[str], Depends(oauth2_bearer)],
    db: db_dependency
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail='Could not validate credentials',
        headers={"WWW-Authenticate": "Bearer"}
    )
    try:
        token = token or request.cookies.get("access_token")
        if not token:
            raise credentials_exception
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get('sub')
        user_id: int = payload.get('id')
        if username is None or user_id is None:
            raise credentials_exception
    except jwt.JWTError:
        raise credentials_exception

    user = db.query(Users).filter(Users.id == user_id).first()
    if user is None:
        raise credentials_exception
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Inactive user')
    return user


@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_user(
    user: Annotated[Users, Depends(get_current_user)],
    db: db_dependency,
    create_user_request: CreateUserRequest
):
    if user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can create users."
        )

    if create_user_request.role not in {"user", "admin"}:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Role must be either 'user' or 'admin'."
        )

    existing_user = db.query(Users).filter(Users.username == create_user_request.username).first()
    if existing_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='This username already exists.')

    existing_email = db.query(Users).filter(Users.email == create_user_request.email).first()
    if existing_email:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='This email is already registered.')

    create_user_model = Users(
        email=create_user_request.email,
        username=create_user_request.username,
        first_name=create_user_request.first_name,
        last_name=create_user_request.last_name,
        role=create_user_request.role,
        hashed_password=bcrypt_context.hash(create_user_request.password),
        is_active=True,
        phone_number=create_user_request.phone_number
    )
    db.add(create_user_model)
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        error_message = str(exc.orig).lower() if hasattr(exc, 'orig') else str(exc).lower()
        if 'username' in error_message:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='This username already exists.')
        if 'email' in error_message:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='This email is already registered.')
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Unable to create user. Please check your input.')

    db.refresh(create_user_model)
    return {
        'id': create_user_model.id,
        'email': create_user_model.email,
        'username': create_user_model.username,
        'first_name': create_user_model.first_name,
        'last_name': create_user_model.last_name,
        'role': create_user_model.role,
        'phone_number': create_user_model.phone_number,
        'is_active': create_user_model.is_active,
    }

@router.post("/token")
async def login_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    response: Response,
    db: db_dependency
):
    user = authenticate_user(form_data.username, form_data.password, db)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Could not validate credentials')
    
    token = create_access_token(
        user.username,
        user.id,
        user.role,
        timedelta(minutes=ACCESS_TOKEN_MINUTES)
    )
    response.set_cookie(
        key="access_token",
        value=token,
        max_age=ACCESS_TOKEN_MINUTES * 60,
        httponly=True,
        secure=COOKIE_SECURE,
        samesite="lax",
        path="/"
    )
    response.set_cookie(
        key="csrf_token",
        value=secrets.token_urlsafe(32),
        max_age=ACCESS_TOKEN_MINUTES * 60,
        httponly=False,
        secure=COOKIE_SECURE,
        samesite="lax",
        path="/"
    )
    return {"message": "Login successful"}


@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie(
        key="access_token",
        httponly=True,
        secure=COOKIE_SECURE,
        samesite="lax",
        path="/"
    )
    response.delete_cookie(
        key="csrf_token",
        httponly=False,
        secure=COOKIE_SECURE,
        samesite="lax",
        path="/"
    )
    return {"message": "Logged out"}
