import os
import sys

# Add parent backend directory to sys.path so app module is importable
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.main import app  # noqa: F401

