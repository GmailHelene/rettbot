import os
import sys
import uvicorn
from pathlib import Path

# Add backend to Python path
backend_dir = Path(__file__).parent / 'backend'
sys.path.insert(0, str(backend_dir))

if __name__ == '__main__':
    port = int(os.getenv('PORT', 8000))
    # DON'T change working directory - stay in root so we can serve frontend files
    # os.chdir(backend_dir)  # REMOVED - this breaks frontend serving

    # Bevisst ÉN worker. Rate-limiteren er in-memory og deles ikke mellom
    # prosesser/replicas. Vil du skalere til flere workers, må rate-limitingen
    # først flyttes til Redis (se ARKITEKTUR.md -> "Kjent teknisk gjeld").
    workers = int(os.getenv('WEB_CONCURRENCY', '1'))
    if workers != 1:
        print(
            f"ADVARSEL: WEB_CONCURRENCY={workers}. In-memory rate limiting virker "
            "korrekt kun med 1 worker. Bruk Redis for delt takst ved skalering."
        )
    uvicorn.run('backend.main:app', host='0.0.0.0', port=port, workers=workers)
