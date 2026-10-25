"""Add ticket-only User Type and Location values.

Revision ID: d4e8a9b1c732
Revises: c91f4b2a7d30
Create Date: 2026-10-24
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "d4e8a9b1c732"
down_revision: Union[str, Sequence[str], None] = "c91f4b2a7d30"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("tickets", sa.Column("user_type_other", sa.String(), nullable=True))
    op.add_column("tickets", sa.Column("location_other", sa.String(), nullable=True))


def downgrade() -> None:
    op.drop_column("tickets", "location_other")
    op.drop_column("tickets", "user_type_other")
