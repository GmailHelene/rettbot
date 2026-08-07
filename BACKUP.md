# Backup-rutine - RettBot+

Databasen (PostgreSQL på Railway) inneholder sensitive saksdata. Backup skal
være kryptert og aldri ligge ukryptert eller i git/GitHub.

**Viktig:** Railways egne backups og point-in-time recovery (PITR) krever **Pro-plan**.
Er du på gratis/Hobby-plan, er det lokale krypterte scriptet under din primære backup.

### Realistisk vurdering akkurat nå
Så lenge tjenesten er ny og har lite eller ingen ekte brukerdata, er tapsrisikoen
lav - det er nesten ingenting å miste. Ikke stress med dette mens du er borte.
Rutinen og scriptet ligger klart. Ta det seriøst i det øyeblikket ekte brukere
begynner å legge inn saker: da enten (a) skru på Railway Pro-backup (ett klikk),
eller (b) kjør scriptet under jevnlig.

## 1. Railway-backup (hvis/når du er på Pro)

1. [railway.app](https://railway.app) → prosjektet → klikk **PostgreSQL-tjenesten**.
2. Fanen **«Backups»**.
3. Slå på **«Scheduled backups»** (daglig) + ta én **manuell snapshot** som startpunkt.

Dataene blir liggende kryptert inne i Railway. Dette er det enkleste når du først
har Pro.

## 2. Lokal kryptert kopi (primær på gratisplan / ekstra trygghet ellers)

Bruk `scripts/backup_db.sh`. Den tar en `pg_dump`, komprimerer og krypterer med GPG.
Kjør den jevnlig (og alltid før en større endring).

```bash
# 1. Hent DATABASE_URL fra Railway: Postgres-tjenesten -> Variables -> DATABASE_URL
# 2. Kjør (du blir bedt om et krypteringspassord - HUSK DET):
DATABASE_URL="postgresql://..." ./scripts/backup_db.sh
```

Resultatet havner i `./backups/rettbot_<dato>.sql.gz.gpg` (kryptert). Mappen er
gitignorert. Oppbevar fila trygt - passordet trengs for å gjenopprette.

Krav lokalt: PostgreSQL client tools (`pg_dump`) + `gnupg` (`gpg`). På Windows:
installer «PostgreSQL» (gir pg_dump) og «Gpg4win». Scriptet kjøres i Git Bash / WSL.

## 3. Gjenoppretting (restore)

**Fra Railway-snapshot:** bruk «Restore» på snapshotet i Backups-fanen. Enklest.

**Fra lokal kryptert dump:**
```bash
# Dekrypter + pakk ut + spill inn i en database (f.eks. en fersk Railway-DB eller lokal):
gpg --decrypt backups/rettbot_<dato>.sql.gz.gpg | gunzip | psql "<MÅL_DATABASE_URL>"
```
Restore til en **tom/fersk** database. Ikke spill oppå en DB med data du vil beholde.

## 4. Test restore av og til

En backup du aldri har testet, er ikke en backup du kan stole på. Et par ganger i
året: dekrypter en dump og spill den inn i en lokal test-database, og sjekk at
tabellene og et par rader er der. Da vet du at rutinen faktisk virker.

## 5. Kort oppsummert

- **Nå:** slå på Railway scheduled backups (eller ta manuell snapshot).
- **Jevnlig:** kjør `scripts/backup_db.sh` for en kryptert off-platform-kopi.
- **Aldri:** ukryptert dump i git, GitHub, e-post eller skylagring uten kryptering.
