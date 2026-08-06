"""baseline - skjema eies av init_database

Revision ID: e2447534cda2
Revises: 
Create Date: 2026-08-07 00:43:37.776572

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e2447534cda2'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Baseline. Bevisst tom: grunn-tabellene opprettes av init_database()
    (CREATE TABLE IF NOT EXISTS). Denne revisjonen markerer bare startpunktet, så
    den er trygg å kjøre mot en prod-DB som allerede har tabellene. Nye
    skjemaendringer legges til som egne revisjoner etter denne."""
    pass


def downgrade() -> None:
    """Baseline har ingenting å rulle tilbake."""
    pass
