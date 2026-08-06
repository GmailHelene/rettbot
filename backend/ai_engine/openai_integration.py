"""
DEPRECATED: RettBot+ er migrert fra OpenAI til Anthropic Claude.

Denne fila beholdes kun som bakoverkompatibel shim. All faktisk logikk
ligger nå i `claude_integration.py`. Bruk `ClaudeEngine` derfra i ny kode.
"""

from .claude_integration import (  # noqa: F401
    ClaudeEngine,
    OpenAIEngine,
    EvidenceAssessment,
    LegalResearch,
    DefenseStrategy,
)

__all__ = [
    "ClaudeEngine",
    "OpenAIEngine",
    "EvidenceAssessment",
    "LegalResearch",
    "DefenseStrategy",
]
