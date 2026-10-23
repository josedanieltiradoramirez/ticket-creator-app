"""Add contact and device fields to tickets.

Revision ID: c91f4b2a7d30
Revises: e40865dce2f5
Create Date: 2026-10-22
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "c91f4b2a7d30"
down_revision: Union[str, Sequence[str], None] = "e40865dce2f5"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("tickets", sa.Column("secondary_contact", sa.String(), nullable=True))
    op.add_column("tickets", sa.Column("preferred_contact_method", sa.String(), nullable=True))
    op.add_column("tickets", sa.Column("best_contact_hours", sa.String(), nullable=True))
    op.add_column("tickets", sa.Column("device_name", sa.String(), nullable=True))
    op.add_column("tickets", sa.Column("employee_id", sa.String(), nullable=True))


def downgrade() -> None:
    op.drop_column("tickets", "employee_id")
    op.drop_column("tickets", "device_name")
    op.drop_column("tickets", "best_contact_hours")
    op.drop_column("tickets", "preferred_contact_method")
    op.drop_column("tickets", "secondary_contact")
