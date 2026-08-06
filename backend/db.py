"""
Databaselag for RettBot+.

Støtter SQLite lokalt (ingen konfig) og PostgreSQL i produksjon (via DATABASE_URL).
Railway setter DATABASE_URL automatisk når du legger til en Postgres-tjeneste.

Bruk get_connection() akkurat som sqlite3.connect():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT id FROM users WHERE email = ?", (email,))
    row = cur.fetchone()
    conn.close()

'?'-plassholdere oversettes automatisk til '%s' når vi kjører mot Postgres,
slik at resten av koden kan skrives i én dialekt.
"""

import os
import sqlite3
from pathlib import Path

DATABASE_URL = os.getenv("DATABASE_URL", "").strip()
IS_POSTGRES = DATABASE_URL.startswith(("postgres://", "postgresql://"))

# SQLite-fil brukes kun når DATABASE_URL ikke er satt (lokal utvikling).
SQLITE_PATH = Path(__file__).parent / "rettbot.db"

# Dialektavhengig auto-inkrement primærnøkkel (brukes i CREATE TABLE).
ID_COLUMN = "SERIAL PRIMARY KEY" if IS_POSTGRES else "INTEGER PRIMARY KEY AUTOINCREMENT"

if IS_POSTGRES:
    import psycopg  # importeres kun i produksjon


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
    """Tynn connection-wrapper som gir _Cursor og støtter with-blokk."""

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
    """Returner en DB-tilkobling – Postgres hvis DATABASE_URL er satt, ellers SQLite."""
    if IS_POSTGRES:
        return _Connection(psycopg.connect(DATABASE_URL))
    return _Connection(sqlite3.connect(str(SQLITE_PATH)))


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
