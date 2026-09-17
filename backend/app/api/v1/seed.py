from datetime import date, datetime, timedelta, timezone
from typing import Any, Dict

from fastapi import APIRouter, Depends, status
from shapely.geometry import Polygon
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.core.security import get_password_hash
from app.models.analytics import SiteAnalytics
from app.models.project import Project
from app.models.site import Site
from app.models.user import User
from app.services.geospatial import calculate_geodesic_area_sq_km, shapely_to_wkb_element

router = APIRouter()

@router.post("", status_code=status.HTTP_200_OK)
@router.post("/", status_code=status.HTTP_200_OK)
@router.get("", status_code=status.HTTP_200_OK)
@router.get("/", status_code=status.HTTP_200_OK)
def seed_demo_data(db: Session = Depends(get_db)) -> Dict[str, Any]:
    """Seed demo administrator user, realistic projects, spatial sites, and time-series analytics."""
    
    # 1. Create or get Demo User
    demo_user = db.query(User).filter(User.email == "admin@darukaa.earth").first()
    if not demo_user:
        demo_user = User(
            name="Demo Administrator",
            email="admin@darukaa.earth",
            password_hash=get_password_hash("Password123!"),
            role="admin"
        )
        db.add(demo_user)
        db.commit()
        db.refresh(demo_user)

    # 2. Seed Projects if none exist for user
    existing_projects = db.query(Project).filter(Project.owner_id == demo_user.id).all()
    if not existing_projects:
        proj1 = Project(
            owner_id=demo_user.id,
            name="Western Ghats Rainforest Reserve",
            description="High-biodiversity tropical rainforest restoration and wildlife corridor canopy protection.",
            category="Biodiversity Conservation",
            region="Western Ghats, India",
            status="Active",
            start_date=date(2025, 1, 15),
            end_date=None
        )
        proj2 = Project(
            owner_id=demo_user.id,
            name="Amazonian Agroforestry Canopy",
            description="Sustainable agroforestry carbon sink and community forest management initiative.",
            category="Reforestation",
            region="Pará State, Brazil",
            status="Active",
            start_date=date(2024, 6, 1),
            end_date=None
        )
        proj3 = Project(
            owner_id=demo_user.id,
            name="Black Forest Ecosystem Restoration",
            description="Conifer-to-broadleaf transition and soil carbon enhancement monitoring.",
            category="Forest Restoration",
            region="Baden-Württemberg, Germany",
            status="Planning",
            start_date=date(2026, 3, 1),
            end_date=None
        )
        db.add_all([proj1, proj2, proj3])
        db.commit()
        db.refresh(proj1)
        db.refresh(proj2)
        db.refresh(proj3)

        # 3. Seed Sites with Real Geodesic Geometries
        # Site 1: Western Ghats Canopy (Near Wayanad / Nilgiris)
        poly1_coords = [
            (76.1200, 11.6000), (76.1500, 11.6000),
            (76.1500, 11.6300), (76.1200, 11.6300),
            (76.1200, 11.6000)
        ]
        poly1 = Polygon(poly1_coords)
        area1 = calculate_geodesic_area_sq_km(poly1)

        site1 = Site(
            project_id=proj1.id,
            name="Nilgiri Foothills Sector A",
            description="Dense tropical canopy sector under bio-monitoring.",
            geom=shapely_to_wkb_element(poly1),
            area_sq_km=area1
        )

        # Site 2: Silent Valley Corridor
        poly2_coords = [
            (76.2400, 11.1000), (76.2800, 11.1000),
            (76.2700, 11.1400), (76.2300, 11.1300),
            (76.2400, 11.1000)
        ]
        poly2 = Polygon(poly2_coords)
        area2 = calculate_geodesic_area_sq_km(poly2)

        site2 = Site(
            project_id=proj1.id,
            name="Silent Valley Buffer Site B",
            description="Secondary growth restoration zone.",
            geom=shapely_to_wkb_element(poly2),
            area_sq_km=area2
        )

        # Site 3: Amazon Agroforestry Plot
        poly3_coords = [
            (-54.9500, -3.1200), (-54.9000, -3.1200),
            (-54.9000, -3.0700), (-54.9500, -3.0700),
            (-54.9500, -3.1200)
        ]
        poly3 = Polygon(poly3_coords)
        area3 = calculate_geodesic_area_sq_km(poly3)

        site3 = Site(
            project_id=proj2.id,
            name="Tapajós Agroforestry Sector 1",
            description="Community shade-grown cocoa and native canopy plot.",
            geom=shapely_to_wkb_element(poly3),
            area_sq_km=area3
        )

        db.add_all([site1, site2, site3])
        db.commit()
        db.refresh(site1)
        db.refresh(site2)
        db.refresh(site3)

        # 4. Seed Time-Series Analytics
        now = datetime.now(timezone.utc)
        for s in [site1, site2, site3]:
            for month in range(12):
                rec_date = now - timedelta(days=(11 - month) * 30)
                db.add(SiteAnalytics(
                    site_id=s.id,
                    metric_name="soil_carbon_density",
                    metric_value=round(110.0 + month * 2.1 + (hash(str(s.id)) % 15), 2),
                    unit="t CO2e/ha",
                    recorded_at=rec_date,
                    data_source="Sentinel-2 Soil Model",
                    is_simulated=True
                ))
                db.add(SiteAnalytics(
                    site_id=s.id,
                    metric_name="canopy_cover_pct",
                    metric_value=round(min(68.0 + month * 0.8, 95.0), 1),
                    unit="%",
                    recorded_at=rec_date,
                    data_source="Landsat 9 Canopy Index",
                    is_simulated=True
                ))
                db.add(SiteAnalytics(
                    site_id=s.id,
                    metric_name="ndvi_index",
                    metric_value=round(min(0.70 + month * 0.012, 0.92), 3),
                    unit="index (0-1)",
                    recorded_at=rec_date,
                    data_source="Sentinel-2 L2A NDVI",
                    is_simulated=True
                ))
        db.commit()

    return {
        "status": "success",
        "message": "Demo user and sample geospatial dataset successfully seeded.",
        "demo_credentials": {
            "email": "admin@darukaa.earth",
            "password": "Password123!"
        }
    }
