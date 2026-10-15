"""add user type to tickets

Revision ID: a27addd99ae2
Revises: 06c4308a0244
Create Date: 2026-10-14 17:48:53.950047

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "a27addd99ae2"
down_revision: Union[str, Sequence[str], None] = "06c4308a0244"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add user_type_id to tickets without losing existing user_type data."""

    # 1. Add the new column
    op.add_column(
        "tickets",
        sa.Column(
            "user_type_id",
            sa.Integer(),
            nullable=True
        )
    )

    # 2. Add the foreign key
    op.create_foreign_key(
        "fk_tickets_user_type_id",
        "tickets",
        "user_types",
        ["user_type_id"],
        ["id"]
    )

    # 3. Rename the existing index so it matches the new model name
    op.drop_index(
        "ix_employee_types_id",
        table_name="user_types"
    )

    op.create_index(
        "ix_user_types_id",
        "user_types",
        ["id"],
        unique=False
    )

    # IMPORTANT:
    # We intentionally DO NOT drop tickets.user_type yet.
    #
    # Existing ticket values need to be migrated first.


def downgrade() -> None:
    """Reverse the migration."""

    # Remove the new index
    op.drop_index(
        "ix_user_types_id",
        table_name="user_types"
    )

    # Restore the old index
    op.create_index(
        "ix_employee_types_id",
        "user_types",
        ["id"],
        unique=False
    )

    # Remove the foreign key
    op.drop_constraint(
        "fk_tickets_user_type_id",
        "tickets",
        type_="foreignkey"
    )

    # Remove the new column
    op.drop_column(
        "tickets",
        "user_type_id"
    )