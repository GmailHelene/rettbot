"""Alembic-miljø for RettBot+.

Bruker appens egen SQLAlchemy-engine (backend/db.py), så migrasjoner treffer
samme database som appen: SQLite lokalt, PostgreSQL i produksjon (via DATABASE_URL).

Grunn-skjemaet opprettes av init_database() (CREATE TABLE IF NOT EXISTS). Alembic
styrer ENDRINGER fra baseline og framover (håndskrevne migrasjoner, f.eks.
op.add_column). Autogenerate er derfor ikke i bruk (target_metadata = None).
"""

import sys
from logging.config import fileConfig
from pathlib import Path

from alembic import context

# Repo-roten på path, så backend.* kan importeres når alembic kjøres fra CLI.
_ROOT = Path(__file__).resolve().parents[2]
if str(_ROOT) not in sys.path:
    sys.path.insert(0, str(_ROOT))

from backend.db import _engine  # noqa: E402  (appens engine)

config = context.config
if config.config_file_name is not None:
    try:
        fileConfig(config.config_file_name)
    except Exception:
        pass

target_metadata = None


def run_migrations_offline() -> None:
    context.configure(
        url=str(_engine.url),
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    with _engine.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
