from typing import List, Optional
from uuid import UUID
from datetime import datetime
import io
import json
import csv
from fastapi import APIRouter, Depends, HTTPException, status, Query, Response
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.models.project import Project
from app.models.site import Site
from app.models.analytics import SiteAnalytics
from app.schemas.analytics import AnalyticsPoint, GlobalSummary
from app.services.geospatial import wkb_to_geojson_dict

router = APIRouter()

@router.get("/sites/{site_id}/analytics", response_model=List[AnalyticsPoint])
def get_site_analytics(
    site_id: UUID,
    metric_name: Optional[str] = Query(None, description="Filter by metric: soil_carbon_density, canopy_cover_pct, ndvi_index"),
    date_from: Optional[datetime] = Query(None),
    date_to: Optional[datetime] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve time-series analytics points for a site owned by current user."""
    site = db.query(Site).join(Project).filter(Site.id == site_id, Project.owner_id == current_user.id).first()
    if not site:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Site not found or access denied"
        )

    query = db.query(SiteAnalytics).filter(SiteAnalytics.site_id == site_id)
    if metric_name:
        query = query.filter(SiteAnalytics.metric_name == metric_name)
    if date_from:
        query = query.filter(SiteAnalytics.recorded_at >= date_from)
    if date_to:
        query = query.filter(SiteAnalytics.recorded_at <= date_to)

    records = query.order_by(SiteAnalytics.recorded_at.asc()).all()
    return records

@router.get("/analytics/summary", response_model=GlobalSummary)
def get_analytics_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get aggregated metrics summary across all projects owned by current user."""
    user_projects = db.query(Project).filter(Project.owner_id == current_user.id).all()
    total_projects = len(user_projects)

    project_ids = [p.id for p in user_projects]
    if not project_ids:
        return GlobalSummary(
            total_projects=0,
            total_sites=0,
            total_mapped_area_sq_km=0.0,
            total_mapped_area_ha=0.0,
            latest_carbon_metric_t_co2e=0.0
        )

    user_sites = db.query(Site).filter(Site.project_id.in_(project_ids)).all()
    total_sites = len(user_sites)
    total_area_sq_km = sum(s.area_sq_km for s in user_sites) if user_sites else 0.0

    site_ids = [s.id for s in user_sites]
    avg_carbon = 0.0
    if site_ids:
        # Get latest carbon metric per site
        subq = db.query(
            SiteAnalytics.site_id,
            func.max(SiteAnalytics.recorded_at).label("max_date")
        ).filter(
            SiteAnalytics.site_id.in_(site_ids),
            SiteAnalytics.metric_name == "soil_carbon_density"
        ).group_by(SiteAnalytics.site_id).subquery()

        latest_records = db.query(SiteAnalytics.metric_value).join(
            subq,
            (SiteAnalytics.site_id == subq.c.site_id) & (SiteAnalytics.recorded_at == subq.c.max_date)
        ).filter(SiteAnalytics.metric_name == "soil_carbon_density").all()

        if latest_records:
            avg_carbon = round(sum(r[0] for r in latest_records) / len(latest_records), 2)

    return GlobalSummary(
        total_projects=total_projects,
        total_sites=total_sites,
        total_mapped_area_sq_km=round(total_area_sq_km, 4),
        total_mapped_area_ha=round(total_area_sq_km * 100.0, 2),
        latest_carbon_metric_t_co2e=avg_carbon
    )

@router.get("/sites/{site_id}/export/csv")
def export_site_analytics_csv(
    site_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Export time-series analytics records for a site as a downloadable CSV file."""
    site = db.query(Site).join(Project).filter(Site.id == site_id, Project.owner_id == current_user.id).first()
    if not site:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Site not found or access denied"
        )

    records = db.query(SiteAnalytics).filter(SiteAnalytics.site_id == site_id).order_by(SiteAnalytics.recorded_at.asc()).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["record_id", "site_id", "site_name", "metric_name", "metric_value", "unit", "recorded_at", "data_source", "is_simulated"])

    for r in records:
        writer.writerow([
            str(r.id), str(r.site_id), site.name, r.metric_name, r.metric_value, r.unit, r.recorded_at.isoformat(), r.data_source, r.is_simulated
        ])

    output.seek(0)
    filename = f"darukaa_site_{site.name.lower().replace(' ', '_')}_analytics.csv"
    return StreamingResponse(
        io.BytesIO(output.getvalue().encode('utf-8')),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@router.get("/sites/{site_id}/export/geojson")
def export_site_geojson(
    site_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Export site geometry and properties as a downloadable GeoJSON file."""
    site = db.query(Site).join(Project).filter(Site.id == site_id, Project.owner_id == current_user.id).first()
    if not site:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Site not found or access denied"
        )

    geom_dict = wkb_to_geojson_dict(site.geom)
    feature = {
        "type": "Feature",
        "id": str(site.id),
        "geometry": geom_dict,
        "properties": {
            "id": str(site.id),
            "project_id": str(site.project_id),
            "project_name": site.project.name,
            "site_name": site.name,
            "description": site.description or "",
            "area_sq_km": round(site.area_sq_km, 4),
            "area_ha": round(site.area_sq_km * 100.0, 2),
            "created_at": site.created_at.isoformat()
        }
    }
    filename = f"darukaa_site_{site.name.lower().replace(' ', '_')}.geojson"
    return Response(
        content=json.dumps(feature, indent=2),
        media_type="application/geo+json",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
