import os
import sys

# Ensure the backend directory is in sys.path so app modules are resolved
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend"))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.main import app  # noqa: E402

try:
    from mangum import Mangum
    handler = Mangum(app)
except ImportError:
    handler = app

# Expose both app (ASGI) and handler (Mangum/Lambda adapter) for Vercel Serverless
__all__ = ["app", "handler"]
