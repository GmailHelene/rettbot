# Juridiske evals

Automatiske tester som sjekker at AI-en oppgir **riktige frister og paragrafer**.
Dette er den farligste feilen verktøyet kan gjøre: sier RettBot+ «6 ukers
klagefrist» der forvaltningsloven § 29 sier tre uker, kan brukeren tape saken.

## Filer
- `legal_facts.py` – fasiten: verifiserte fakta + testtilfeller (`EVAL_CASES`).
- `run_evals.py` – kjører hvert spørsmål mot Claude og sjekker svaret mot fasiten.

## Kjøre
Fra repo-roten, med `ANTHROPIC_API_KEY` satt (koster litt API-bruk):

```bash
python -m backend.evals.run_evals
```

Rapporten viser PASS/FAIL per tilfelle og totalen. Exit-kode 0 = alt bestått.

## Utvide (mål: 50+)
Legg til flere objekter i `EVAL_CASES` i `legal_facts.py`. Hvert tilfelle:

```python
{
  "id": "kort-id",
  "case_type": "forvaltning | straffesak | sivil | menneskerettigheter",
  "question": "Spørsmålet slik en bruker ville stilt det",
  "must_contain": [["3 uker", "tre uker"], ["§ 29", "forvaltningsloven"]],
  "note": "Fasit-forklaring til mennesket som leser rapporten",
}
```

`must_contain` er en liste av grupper. Svaret er riktig når minst én variant i
HVER gruppe finnes i AI-svaret. Slik tåler vi «3 uker» vs «tre uker».

## Viktig
- Fasiten bør **bekreftes og utvides av en jurist**. Ikke stol blindt på den –
  poenget er nettopp å teste, så feil fasit er verre enn ingen.
- Kjør gjerne evalene før hver større endring i AI-promptene, og etter modell-
  bytte, for å fange regresjoner i juridisk presisjon.
- Neste steg (Fase 3): kjøre disse automatisk i CI (GitHub Actions) med et lite,
  fast utvalg.
