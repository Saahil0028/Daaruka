from uuid import UUID
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel

class AnalyticsPoint(BaseModel):
    id: UUID
    site_id: UUID
    metric_name: str
    metric_value: float
    unit: str
    recorded_at: datetime
    data_source: str
    is_simulated: bool

    class Config:
        from_attributes = True

class SiteAnalyticsSeries(BaseModel):
    site_id: UUID
    metric_name: str
    unit: str
    data_source: str
    is_simulated: bool
    data: List[AnalyticsPoint]

class GlobalSummary(BaseModel):
    total_projects: int
    total_sites: int
    total_mapped_area_sq_km: float
    total_mapped_area_ha: float
    latest_carbon_metric_t_co2e: float
    simulated_notice: str = "All environmental metrics are clearly labeled sample/simulated data models."
