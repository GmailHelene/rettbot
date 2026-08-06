"""
Kjør juridiske evals mot AI-motoren.

Sender hvert spørsmål i legal_facts.EVAL_CASES til Claude via legal_research(),
og sjekker at svaret inneholder de riktige fristene/paragrafene. Skriver en
rapport og returnerer exit-kode 0 hvis alt bestod, ellers 1.

Kjør fra repo-roten (krever ANTHROPIC_API_KEY, og koster litt API-bruk):

    python -m backend.evals.run_evals

Eller direkte:

    python backend/evals/run_evals.py
"""

import asyncio
import os
import sys
from pathlib import Path

# Sørg for at repo-roten er på path når fila kjøres direkte.
_ROOT = Path(__file__).resolve().parents[2]
if str(_ROOT) not in sys.path:
    sys.path.insert(0, str(_ROOT))

from backend.ai_engine.claude_integration import ClaudeEngine  # noqa: E402
from backend.evals.legal_facts import EVAL_CASES  # noqa: E402


def _check(blob: str, must_contain):
    """Returner liste av grupper som IKKE er dekket av svaret."""
    low = blob.lower()
    return [grp for grp in must_contain if not any(v.lower() in low for v in grp)]


async def run() -> int:
    if not os.getenv("ANTHROPIC_API_KEY"):
        print("ANTHROPIC_API_KEY mangler - kan ikke kjøre AI-evals.")
        return 2

    engine = ClaudeEngine()
    passed = 0
    print(f"Kjører {len(EVAL_CASES)} juridiske evals ...\n")

    for c in EVAL_CASES:
        try:
            res = await engine.legal_research(
                c["question"], c.get("context", ""), c.get("case_type", "forvaltning")
            )
            blob = " ".join(
                [res.answer]
                + list(res.norwegian_laws)
                + list(res.citations)
                + list(res.recommendations)
            )
            missing = _check(blob, c["must_contain"])
        except Exception as exc:  # noqa: BLE001
            missing = [["<feil under kjøring>"]]
            print(f"  (feil: {exc})")

        ok = not missing
        passed += int(ok)
        print(f"[{'PASS' if ok else 'FAIL'}] {c['id']}: {c['question'][:70]}")
        if not ok:
            print(f"        forventet (mangler): {missing}")
            print(f"        fasit: {c.get('note', '')}")

    print(f"\n{passed}/{len(EVAL_CASES)} bestått.")
    if passed != len(EVAL_CASES):
        print("Minst én eval feilet. Sjekk om AI-en oppgir feil frist/paragraf, "
              "eller om fasiten må justeres.")
    return 0 if passed == len(EVAL_CASES) else 1


if __name__ == "__main__":
    raise SystemExit(asyncio.run(run()))
