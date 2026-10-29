from sqlalchemy.orm import Session

from app.models.priorities import Priorities
from app.models.ticket_status import TicketStatus
from app.models.user_types import UserTypes


DEFAULT_USER_TYPES = ("Employee", "Contractor", "Customer")
DEFAULT_TICKET_STATUSES = ("New", "In progress", "Waiting", "Completed")
DEFAULT_PRIORITIES = ("Low", "Medium", "High", "Critical")


def ensure_default_catalog_data(db: Session, user_id: int) -> int:
    """Add missing default catalog rows for a user without replacing their data."""
    added = 0
    catalogs = (
        (UserTypes, DEFAULT_USER_TYPES, {"is_active": True}),
        (TicketStatus, DEFAULT_TICKET_STATUSES, {}),
        (Priorities, DEFAULT_PRIORITIES, {}),
    )

    for model, defaults, extra_values in catalogs:
        existing_names = {
            str(name).strip().casefold()
            for (name,) in db.query(model.name).filter(model.created_by == user_id).all()
            if name is not None
        }

        for name in defaults:
            if name.casefold() in existing_names:
                continue

            db.add(model(name=name, created_by=user_id, **extra_values))
            existing_names.add(name.casefold())
            added += 1

    return added
