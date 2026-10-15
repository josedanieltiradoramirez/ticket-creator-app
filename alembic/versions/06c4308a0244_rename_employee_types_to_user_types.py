"""rename employee types to user types

Revision ID: 06c4308a0244
Revises: d343213c839b
Create Date: 2026-10-14 17:43:09.937698

"""
from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = "06c4308a0244"
down_revision: Union[str, Sequence[str], None] = "d343213c839b"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Rename employee_types table to user_types."""
    op.rename_table(
        "employee_types",
        "user_types"
    )


def downgrade() -> None:
    """Rename user_types table back to employee_types."""
    op.rename_table(
        "user_types",
        "employee_types"
    )