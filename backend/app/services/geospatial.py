import json
import math
from typing import Any, Dict, Tuple

from geoalchemy2.shape import from_shape, to_shape
from shapely.geometry import MultiPolygon, Polygon, mapping, shape
from shapely.validation import explain_validity

from app.core.database import is_sqlite


def parse_and_validate_geojson_geometry(geojson_dict: Dict[str, Any]) -> Tuple[Any, float]:
    """
    Parses a GeoJSON geometry dictionary into a Shapely geometry object.
    Validates that it is a valid Polygon or MultiPolygon with no self-intersections.
    Calculates geodesic area in square kilometers.
    """
    try:
        geom = shape(geojson_dict)
    except Exception as e:
        raise ValueError(f"Invalid GeoJSON structure: {str(e)}") from e

    if not isinstance(geom, (Polygon, MultiPolygon)):
        raise ValueError("Geometry must be a GeoJSON Polygon or MultiPolygon")

    if not geom.is_valid:
        reason = explain_validity(geom)
        raise ValueError(f"Invalid polygon geometry (self-intersecting or unclosed): {reason}")

    if geom.is_empty:
        raise ValueError("Polygon geometry cannot be empty")

    area_sq_km = calculate_geodesic_area_sq_km(geom)
    return geom, area_sq_km

def calculate_geodesic_area_sq_km(geom) -> float:
    """Calculates surface area of a polygon on WGS84 ellipsoid in sq km."""
    if isinstance(geom, MultiPolygon):
        return sum(calculate_geodesic_area_sq_km(p) for p in geom.geoms)

    coords = list(geom.exterior.coords)
    if len(coords) < 3:
        return 0.0

    R = 6371.0088 # Earth mean radius in km
    total = 0.0
    num_points = len(coords) - 1

    for i in range(num_points):
        p1 = coords[i]
        p2 = coords[(i + 1) % num_points]
        lon1, lat1 = math.radians(p1[0]), math.radians(p1[1])
        lon2, lat2 = math.radians(p2[0]), math.radians(p2[1])
        total += (lon2 - lon1) * (2 + math.sin(lat1) + math.sin(lat2))

    area_sq_km = abs(total * R * R / 2.0)

    for interior in geom.interiors:
        hole_coords = list(interior.coords)
        if len(hole_coords) >= 3:
            hole_total = 0.0
            hole_num = len(hole_coords) - 1
            for i in range(hole_num):
                p1 = hole_coords[i]
                p2 = hole_coords[(i + 1) % hole_num]
                lon1, lat1 = math.radians(p1[0]), math.radians(p1[1])
                lon2, lat2 = math.radians(p2[0]), math.radians(p2[1])
                hole_total += (lon2 - lon1) * (2 + math.sin(lat1) + math.sin(lat2))
            area_sq_km -= abs(hole_total * R * R / 2.0)

    return max(round(area_sq_km, 4), 0.0001)

def shapely_to_wkb_element(geom):
    """Converts Shapely geometry to GeoAlchemy2 WKBElement or JSON string if SQLite."""
    if is_sqlite:
        return json.dumps(mapping(geom))
    return from_shape(geom, srid=4326)

def wkb_to_geojson_dict(wkb_element) -> Dict[str, Any]:
    """Converts WKBElement or string from DB to GeoJSON dict."""
    if isinstance(wkb_element, str):
        try:
            return json.loads(wkb_element)
        except Exception:
            pass
    if hasattr(wkb_element, "data") or hasattr(wkb_element, "desc"):
        shp = to_shape(wkb_element)
        return mapping(shp)
    elif isinstance(wkb_element, dict):
        return wkb_element
    return mapping(wkb_element)
