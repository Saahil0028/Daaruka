import random
from datetime import datetime, timedelta, timezone
from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.analytics import SiteAnalytics
from app.models.project import Project
from app.models.site import Site
from app.models.user import User
from app.schemas.geo import GeoJSONFeature, GeoJSONFeatureCollection
from app.schemas.site import SiteCreate, SiteResponse, SiteUpdate
from app.services.geospatial import (
    parse_and_validate_geojson_geometry,
    shapely_to_wkb_element,
    wkb_to_geojson_dict,
)

router = APIRouter()

def build_site_response(site: Site) -> SiteResponse:
    geometry_dict = wkb_to_geojson_dict(site.geom)
    area_sq_km = round(site.area_sq_km, 4)
    area_ha = round(area_sq_km * 100.0, 2)

    return SiteResponse(
        id=site.id,
        project_id=site.project_id,
        name=site.name,
        description=site.description,
        geometry=geometry_dict,
        area_sq_km=area_sq_km,
        area_ha=area_ha,
        created_at=site.created_at,
        updated_at=site.updated_at
    )

def generate_initial_analytics_for_site(site_id: UUID, db: Session):
    """Seed sample time-series analytics records for a newly created site."""
    now = datetime.now(timezone.utc)
    base_carbon = random.uniform(80.0, 180.0)
    base_canopy = random.uniform(55.0, 92.0)
    base_ndvi = random.uniform(0.62, 0.88)

    # Generate 12 monthly data points going back 1 year
    analytics_records = []
    for i in range(12):
        recorded_date = now - timedelta(days=(11 - i) * 30)
        
        # Add realistic subtle variations
        c_val = round(base_carbon + (i * 1.8) + random.uniform(-3.0, 3.0), 2)
        canopy_val = round(min(base_canopy + (i * 0.4) + random.uniform(-1.5, 1.5), 98.0), 1)
        ndvi_val = round(min(base_ndvi + (i * 0.008) + random.uniform(-0.02, 0.02), 0.95), 3)

        analytics_records.append(SiteAnalytics(
            site_id=site_id,
            metric_name="soil_carbon_density",
            metric_value=max(c_val, 10.0),
            unit="t CO2e/ha",
            recorded_at=recorded_date,
            data_source="Sentinel-2 L2A Soil Model",
            is_simulated=True
        ))
        analytics_records.append(SiteAnalytics(
            site_id=site_id,
            metric_name="canopy_cover_pct",
            metric_value=max(canopy_val, 5.0),
            unit="%",
            recorded_at=recorded_date,
            data_source="Landsat 9 Vegetation Canopy",
            is_simulated=True
        ))
        analytics_records.append(SiteAnalytics(
            site_id=site_id,
            metric_name="ndvi_index",
            metric_value=max(ndvi_val, 0.1),
            unit="index (0-1)",
            recorded_at=recorded_date,
            data_source="Sentinel-2 L2A NDVI",
            is_simulated=True
        ))

    db.add_all(analytics_records)
    db.commit()

@router.get("/sites", response_model=List[SiteResponse])
def list_all_sites(
    project_id: Optional[UUID] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all sites belonging to current user's projects."""
    query = db.query(Site).join(Project).filter(Project.owner_id == current_user.id)
    if project_id:
        query = query.filter(Site.project_id == project_id)

    sites = query.order_by(Site.created_at.desc()).all()
    return [build_site_response(s) for s in sites]

@router.get("/sites/geojson", response_model=GeoJSONFeatureCollection)
def list_all_sites_geojson(
    project_id: Optional[UUID] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Return all sites as a GeoJSON FeatureCollection for Mapbox GL JS rendering."""
    query = db.query(Site).join(Project).filter(Project.owner_id == current_user.id)
    if project_id:
        query = query.filter(Site.project_id == project_id)

    sites = query.all()
    features = []
    for s in sites:
        geom_dict = wkb_to_geojson_dict(s.geom)
        features.append(GeoJSONFeature(
            id=str(s.id),
            geometry=geom_dict,
            properties={
                "id": str(s.id),
                "project_id": str(s.project_id),
                "project_name": s.project.name,
                "project_category": s.project.category,
                "name": s.name,
                "description": s.description or "",
                "area_sq_km": round(s.area_sq_km, 4),
                "area_ha": round(s.area_sq_km * 100.0, 2),
                "created_at": s.created_at.isoformat()
            }
        ))
    return GeoJSONFeatureCollection(features=features)

@router.get("/projects/{project_id}/sites", response_model=List[SiteResponse])
def get_project_sites(
    project_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List sites for a specific project owned by current user."""
    project = db.query(Project).filter(Project.id == project_id, Project.owner_id == current_user.id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found or access denied"
        )

    sites = db.query(Site).filter(Site.project_id == project_id).order_by(Site.created_at.desc()).all()
    return [build_site_response(s) for s in sites]

@router.post("/projects/{project_id}/sites", response_model=SiteResponse, status_code=status.HTTP_201_CREATED)
def create_site_for_project(
    project_id: UUID,
    site_in: SiteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new geospatial site polygon for a project owned by current user."""
    project = db.query(Project).filter(Project.id == project_id, Project.owner_id == current_user.id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found or access denied"
        )

    # Validate GeoJSON geometry and calculate geodesic area
    try:
        shapely_geom, area_sq_km = parse_and_validate_geojson_geometry(site_in.geometry)
    except ValueError as val_err:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid geometry: {str(val_err)}"
        ) from val_err


    wkb_geom = shapely_to_wkb_element(shapely_geom)

    site = Site(
        project_id=project.id,
        name=site_in.name,
        description=site_in.description,
        geom=wkb_geom,
        area_sq_km=area_sq_km
    )
    db.add(site)
    db.commit()
    db.refresh(site)

    # Auto-generate sample time-series analytics for demonstration
    generate_initial_analytics_for_site(site.id, db)

    return build_site_response(site)

@router.get("/sites/{site_id}", response_model=SiteResponse)
def get_site_by_id(
    site_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve site by ID if owned by current user."""
    site = db.query(Site).join(Project).filter(Site.id == site_id, Project.owner_id == current_user.id).first()
    if not site:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Site not found or access denied"
        )
    return build_site_response(site)

@router.put("/sites/{site_id}", response_model=SiteResponse)
def update_site(
    site_id: UUID,
    site_in: SiteUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update site metadata or geometry if owned by current user."""
    site = db.query(Site).join(Project).filter(Site.id == site_id, Project.owner_id == current_user.id).first()
    if not site:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Site not found or access denied"
        )

    if site_in.name is not None:
        site.name = site_in.name
    if site_in.description is not None:
        site.description = site_in.description
    
    if site_in.geometry is not None:
        try:
            shapely_geom, area_sq_km = parse_and_validate_geojson_geometry(site_in.geometry)
            site.geom = shapely_to_wkb_element(shapely_geom)
            site.area_sq_km = area_sq_km
        except ValueError as val_err:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid geometry: {str(val_err)}"
            ) from val_err


    db.commit()
    db.refresh(site)
    return build_site_response(site)

@router.delete("/sites/{site_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_site(
    site_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a site if owned by current user."""
    site = db.query(Site).join(Project).filter(Site.id == site_id, Project.owner_id == current_user.id).first()
    if not site:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Site not found or access denied"
        )

    db.delete(site)
    db.commit()
    return None
