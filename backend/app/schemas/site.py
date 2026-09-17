from datetime import datetime
from typing import Any, Dict, Optional
from uuid import UUID

from pydantic import BaseModel, Field


class SiteCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    description: Optional[str] = None
    geometry: Dict[str, Any] = Field(..., description="GeoJSON Polygon geometry")

class SiteUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    geometry: Optional[Dict[str, Any]] = None

class SiteResponse(BaseModel):
    id: UUID
    project_id: UUID
    name: str
    description: Optional[str] = None
    geometry: Dict[str, Any]
    area_sq_km: float
    area_ha: float
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
