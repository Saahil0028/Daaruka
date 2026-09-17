import sys
import os

# Add parent backend directory to sys.path so app module is importable
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.main import app
