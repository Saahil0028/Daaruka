import logging
import os

from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.api.deps import get_db

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("", status_code=200)
def health_check(db: Session = Depends(get_db)):
    """Healthcheck endpoint verifying DB connectivity and PostGIS status."""
    db_ok = False
    postgis_version = "N/A (SQLite/No-PostGIS)"
    try:
        # Check basic DB query
        result = db.execute(text("SELECT 1")).scalar()
        if result == 1:
            db_ok = True

        # Try to query PostGIS version if available
        try:
            pg_ver = db.execute(text("SELECT PostGIS_Full_Version()")).scalar()
            if pg_ver:
                postgis_version = str(pg_ver)
        except Exception:
            pass
    except Exception as e:
        # Log the exception server-side, but do not leak database credentials
        # or connection strings (which str(e) often contains) in the public HTTP response.
        logger.error(f"Health check database query failed: {e}")
        return {
            "status": "unhealthy",
            "database": "disconnected",
            "postgis_info": None,
            "service": "Darukaa.Earth Backend API",
            "error": "Database connectivity check failed"
        }

    return {
        "status": "healthy" if db_ok else "unhealthy",
        "database": "connected" if db_ok else "disconnected",
        "postgis_info": postgis_version,
        "service": "Darukaa.Earth Backend API"
    }


@router.get("/config", status_code=200)
def get_public_config():
    """Return public frontend configuration such as Mapbox public access token.
    
    Ensures sensitive secret keys (e.g. Mapbox secret tokens starting with 'sk.',
    database credentials, or placeholder secrets) are NEVER shared with clients.
    """
    token = (os.getenv("VITE_MAPBOX_TOKEN") or os.getenv("MAPBOX_TOKEN") or "").strip()
    # Mapbox public tokens start with 'pk.'. Secret administrative keys start with 'sk.'.
    # We strictly enforce only public tokens are shared to prevent accidental credential leakage.
    is_valid_public_token = token.startswith("pk.") and "example" not in token.lower()
    return {
        "mapbox_token": token if is_valid_public_token else ""
    }

