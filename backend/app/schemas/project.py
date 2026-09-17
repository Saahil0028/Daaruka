from datetime import date, datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field


class ProjectCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    description: Optional[str] = None
    category: str = Field(..., example="Forest Restoration")
    region: str = Field(..., min_length=2, max_length=255)
    status: str = Field(default="Planning", example="Active")
    start_date: date
    end_date: Optional[date] = None

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    region: Optional[str] = None
    status: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None

class ProjectResponse(BaseModel):
    id: UUID
    owner_id: UUID
    name: str
    description: Optional[str] = None
    category: str
    region: str
    status: str
    start_date: date
    end_date: Optional[date] = None
    sites_count: int = 0
    total_area_sq_km: float = 0.0
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
