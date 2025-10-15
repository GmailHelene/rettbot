import os
import sys
import uvicorn
from pathlib import Path

# Add backend to Python path
backend_dir = Path(__file__).parent / 'backend'
sys.path.insert(0, str(backend_dir))

if __name__ == '__main__':
    port = int(os.getenv('PORT', 8000))
    # Change working directory to backend
    os.chdir(backend_dir)
    uvicorn.run('main:app', host='0.0.0.0', port=port)
