"""
Databaselag for RettBot+.

Bygger på SQLAlchemys engine for connection pooling og robust håndtering
(`pool_pre_ping` unngår «stale connection»-feil mot Postgres på Railway, og
poolen gjenbruker tilkoblinger i stedet for å åpne en ny per kall).

Grensesnittet er bevisst uendret, så resten av koden ikke trenger å røres:
bruk get_connection() som sqlite3.connect(), med '?'-plassholdere som automatisk
oversettes til '%s' på Postgres.

    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT id FROM users WHERE email = ?", (email,))
    row = cur.fetchone()
    conn.close()  # returnerer tilkoblingen til poolen
"""

import os
from pathlib import Path

from sqlalchemy import create_engine

DATABASE_URL = os.getenv("DATABASE_URL", "").strip()
IS_POSTGRES = DATABASE_URL.startswith(("postgres://", "postgresql://"))

# SQLite-fil brukes kun når DATABASE_URL ikke er satt (lokal utvikling).
SQLITE_PATH = Path(__file__).parent / "rettbot.db"

# Dialektavhengig auto-inkrement primærnøkkel (brukes i CREATE TABLE).
ID_COLUMN = "SERIAL PRIMARY KEY" if IS_POSTGRES else "INTEGER PRIMARY KEY AUTOINCREMENT"


def _make_engine():
    if IS_POSTGRES:
        # SQLAlchemy 2.0 + psycopg (v3). pool_pre_ping sjekker at tilkoblingen lever
        # før bruk; pool_recycle bytter ut tilkoblinger som har blitt for gamle.
        url = DATABASE_URL
        for prefix in ("postgresql://", "postgres://"):
            if url.startswith(prefix):
                url = "postgresql+psycopg://" + url[len(prefix):]
                break
        return create_engine(
            url, pool_pre_ping=True, pool_size=5, max_overflow=5, pool_recycle=1800
        )
    # SQLite: én fil, delt på tvers av tråder (uvicorn kjører sync-kall i threadpool).
    return create_engine(
        f"sqlite:///{SQLITE_PATH}", connect_args={"check_same_thread": False}
    )


_engine = _make_engine()


class _Cursor:
    """Cursor-wrapper som oversetter '?'-plassholdere til '%s' på Postgres."""

    def __init__(self, cur):
        self._cur = cur

    def execute(self, query, params=()):
        if IS_POSTGRES:
            query = query.replace("?", "%s")
        self._cur.execute(query, params)
        return self

    def fetchone(self):
        return self._cur.fetchone()

    def fetchall(self):
        return self._cur.fetchall()

    @property
    def lastrowid(self):
        return getattr(self._cur, "lastrowid", None)

    def __getattr__(self, name):
        return getattr(self._cur, name)


class _Connection:
    """Tynn wrapper rundt en pooled DBAPI-tilkobling.

    close() returnerer tilkoblingen til poolen (lukker den ikke faktisk)."""

    def __init__(self, conn):
        self._conn = conn

    def cursor(self):
        return _Cursor(self._conn.cursor())

    def commit(self):
        self._conn.commit()

    def close(self):
        self._conn.close()

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc, tb):
        self.close()

    def __getattr__(self, name):
        return getattr(self._conn, name)


def get_connection():
    """Hent en tilkobling fra poolen. Grensesnitt likt sqlite3.connect()."""
    return _Connection(_engine.raw_connection())


def database_ok() -> bool:
    """Lettvekts connectivity-sjekk for helsesjekk-endepunktet."""
    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("SELECT 1")
        cur.fetchone()
        conn.close()
        return True
    except Exception:
        return False
