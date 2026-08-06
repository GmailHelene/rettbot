# Databasemigrasjoner (Alembic)

Grunn-skjemaet opprettes av `init_database()` i `backend/main.py`
(`CREATE TABLE IF NOT EXISTS`). Alembic styrer **endringer** fra baseline og
framover - f.eks. å legge til en kolonne, noe `CREATE TABLE IF NOT EXISTS` ikke
klarer på en tabell som allerede finnes i prod.

Migrasjoner kjøres **automatisk ved oppstart**: `start.py` kjører
`alembic upgrade head` før uvicorn. På Railway skjer dette av seg selv ved deploy.
Feiler en migrasjon, logges det og appen starter likevel (grunn-skjemaet sikres av
`init_database`).

## Legge til en skjemaendring

Fra repo-roten, med `.venv` aktivert:

1. Lag en tom migrasjon:
   ```bash
   python -m alembic revision -m "legg til status-kolonne i cases"
   ```
2. Åpne den nye fila i `backend/alembic/versions/` og fyll inn `upgrade()`/`downgrade()`:
   ```python
   def upgrade():
       op.add_column("cases", sa.Column("status", sa.String(), nullable=True))

   def downgrade():
       op.drop_column("cases", "status")
   ```
3. Test lokalt:
   ```bash
   python -m alembic upgrade head
   ```
4. Commit + push. Migrasjonen kjøres automatisk ved neste deploy.

## Nyttige kommandoer

- `python -m alembic current` - hvilken revisjon databasen står på
- `python -m alembic history` - alle revisjoner
- `python -m alembic downgrade -1` - angre siste migrasjon

Autogenerate er **ikke** i bruk (ingen ORM-modeller). Skriv migrasjonene for hånd
med `op.add_column`, `op.drop_column`, `op.create_index` osv. `env.py` bruker appens
egen engine (`backend/db.py`), så migrasjonene treffer riktig database automatisk
(SQLite lokalt, PostgreSQL i prod via `DATABASE_URL`).
