"""Create an administrator directly from a trusted shell, never over HTTP."""

from getpass import getpass

from passlib.context import CryptContext
from sqlalchemy import or_

from app.core.database import SessionLocal
from app.models.users import Users


password_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def main() -> None:
    username = input("Admin username: ").strip()
    email = input("Admin email: ").strip()
    first_name = input("First name: ").strip()
    last_name = input("Last name: ").strip()
    password = getpass("Password (minimum 12 characters): ")
    confirmation = getpass("Confirm password: ")

    if not all((username, email, first_name, last_name)):
        raise SystemExit("Username, email, and name fields are required.")
    if len(password) < 12:
        raise SystemExit("Password must contain at least 12 characters.")
    if password != confirmation:
        raise SystemExit("Passwords do not match.")

    db = SessionLocal()
    try:
        existing = db.query(Users).filter(
            or_(Users.username == username, Users.email == email)
        ).first()
        if existing:
            raise SystemExit("That username or email is already registered.")

        admin = Users(
            username=username,
            email=email,
            first_name=first_name,
            last_name=last_name,
            hashed_password=password_context.hash(password),
            role="admin",
            is_active=True,
            phone_number=""
        )
        db.add(admin)
        db.commit()
        print("Administrator created successfully.")
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
