"""add description to relation issue types tools

Revision ID: e40865dce2f5
Revises: b63df69243ab
Create Date: 2026-10-18 11:29:59.724044

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e40865dce2f5'
down_revision: Union[str, Sequence[str], None] = 'b63df69243ab'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column(
        'relation_issue_types_tools',
        sa.Column('description', sa.String(), nullable=True)
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column(
        'relation_issue_types_tools',
        'description'
    )
