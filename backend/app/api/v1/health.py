from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.api.deps import get_db

router = APIRouter()

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
        return {
            "status": "unhealthy",
            "database": "disconnected",
            "error": str(e)
        }

    return {
        "status": "healthy" if db_ok else "unhealthy",
        "database": "connected" if db_ok else "disconnected",
        "postgis_info": postgis_version,
        "service": "Darukaa.Earth Backend API"
    }
