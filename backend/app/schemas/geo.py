from typing import List, Literal, Union, Dict, Any, Optional
from pydantic import BaseModel, Field

class GeoJSONPolygon(BaseModel):
    type: Literal["Polygon"]
    coordinates: List[List[List[float]]] # [[[lng, lat], [lng, lat], ...]]

class GeoJSONMultiPolygon(BaseModel):
    type: Literal["MultiPolygon"]
    coordinates: List[List[List[List[float]]]]

GeoJSONGeometry = Union[GeoJSONPolygon, GeoJSONMultiPolygon]

class GeoJSONFeature(BaseModel):
    type: Literal["Feature"] = "Feature"
    id: Optional[str] = None
    geometry: Dict[str, Any]
    properties: Dict[str, Any] = Field(default_factory=dict)

class GeoJSONFeatureCollection(BaseModel):
    type: Literal["FeatureCollection"] = "FeatureCollection"
    features: List[GeoJSONFeature]
