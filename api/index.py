import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BACKEND = ROOT / "backend"
if str(BACKEND) not in sys.path:
    sys.path.insert(0, str(BACKEND))

# Use ephemeral storage on Vercel serverless.
if os.getenv("VERCEL"):
    os.environ.setdefault("DATABASE_URL", "sqlite:////tmp/sql_app.db")
    os.environ.setdefault("CORS_ORIGINS", "*")

from app.main import app  # noqa: E402

# Vercel's Python runtime looks for an ASGI/WSGI app named `app`.
