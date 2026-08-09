"""billing-kolonner på users (access_until, ai_free_used, trial_used)

Legges til for dagspass/gratiskvote/prøvekode. Betinget: hopper over hvis users
ikke finnes ennå (fersk DB → init_database lager tabellen med kolonnene) eller
hvis kolonnene allerede finnes (idempotent, trygt å kjøre om igjen).

Revision ID: 0002_billing
Revises: e2447534cda2
"""
from alembic import op
import sqlalchemy as sa

revision = "0002_billing"
down_revision = "e2447534cda2"
branch_labels = None
depends_on = None


def _users_columns(bind):
    insp = sa.inspect(bind)
    if "users" not in insp.get_table_names():
        return None
    return {c["name"] for c in insp.get_columns("users")}


def upgrade():
    cols = _users_columns(op.get_bind())
    if cols is None:
        return
    if "access_until" not in cols:
        op.add_column("users", sa.Column("access_until", sa.Text(), nullable=True))
    if "ai_free_used" not in cols:
        op.add_column("users", sa.Column("ai_free_used", sa.Integer(), server_default="0", nullable=True))
    if "trial_used" not in cols:
        op.add_column("users", sa.Column("trial_used", sa.Integer(), server_default="0", nullable=True))


def downgrade():
    cols = _users_columns(op.get_bind())
    if cols is None:
        return
    for c in ("trial_used", "ai_free_used", "access_until"):
        if c in cols:
            op.drop_column("users", c)
