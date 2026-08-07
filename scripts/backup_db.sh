#!/usr/bin/env bash
#
# Lokal, kryptert backup av RettBot+-databasen (PostgreSQL på Railway).
#
# Tar en pg_dump, komprimerer den, og krypterer med GPG (symmetrisk passord).
# Dumpen inneholder sensitive saksdata, så den lagres ALDRI ukryptert og ALDRI
# i git/GitHub - kun kryptert, lokalt hos deg.
#
# Bruk:
#   1. Hent DATABASE_URL fra Railway (Postgres-tjenesten -> Variables -> DATABASE_URL).
#   2. Kjør:
#        DATABASE_URL="postgresql://..." ./scripts/backup_db.sh
#      (eller sett DATABASE_URL i miljøet først)
#   3. Du blir bedt om et krypteringspassord. HUSK DET - uten det er backupen ubrukelig.
#
# Krav: pg_dump (PostgreSQL client tools) + gpg installert lokalt.
#
# Gjenoppretting (restore) - se BACKUP.md.

set -euo pipefail

if [ -z "${DATABASE_URL:-}" ]; then
  echo "FEIL: DATABASE_URL er ikke satt. Hent den fra Railway (Postgres -> Variables)." >&2
  echo "Eksempel: DATABASE_URL=\"postgresql://...\" ./scripts/backup_db.sh" >&2
  exit 1
fi

for bin in pg_dump gpg gzip; do
  if ! command -v "$bin" >/dev/null 2>&1; then
    echo "FEIL: '$bin' er ikke installert. Installer PostgreSQL client tools og gnupg." >&2
    exit 1
  fi
done

OUT_DIR="${BACKUP_DIR:-./backups}"
mkdir -p "$OUT_DIR"

STAMP="$(date +%Y%m%d_%H%M%S)"
BASENAME="rettbot_${STAMP}.sql.gz.gpg"
OUT_PATH="${OUT_DIR}/${BASENAME}"

echo "Tar backup av databasen..."
# --no-owner/--no-privileges: gjør dumpen enklere å gjenopprette i en fersk DB.
pg_dump "$DATABASE_URL" --no-owner --no-privileges \
  | gzip -9 \
  | gpg --symmetric --cipher-algo AES256 --output "$OUT_PATH"

SIZE="$(du -h "$OUT_PATH" | cut -f1)"
echo "Ferdig: ${OUT_PATH} (${SIZE})"
echo "Oppbevar denne fila trygt. Den er kryptert - passordet du oppga trengs for restore."

# Rydd bort backups eldre enn RETENTION_DAYS (standard 30) i backup-mappen.
RETENTION_DAYS="${RETENTION_DAYS:-30}"
find "$OUT_DIR" -name 'rettbot_*.sql.gz.gpg' -type f -mtime "+${RETENTION_DAYS}" -print -delete 2>/dev/null || true
echo "Beholder backups fra siste ${RETENTION_DAYS} dager."
