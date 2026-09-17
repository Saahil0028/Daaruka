export interface GeoJSONPolygon {
  type: "Polygon";
  coordinates: number[][][];
}

export interface GeoJSONMultiPolygon {
  type: "MultiPolygon";
  coordinates: number[][][][];
}

export type GeoJSONGeometry = GeoJSONPolygon | GeoJSONMultiPolygon;

export interface GeoJSONFeature {
  type: "Feature";
  id?: string;
  geometry: GeoJSONGeometry;
  properties: {
    id: string;
    project_id: string;
    project_name: string;
    project_category: string;
    name: string;
    description: string;
    area_sq_km: number;
    area_ha: number;
    created_at: string;
    [key: string]: any;
  };
}

export interface GeoJSONFeatureCollection {
  type: "FeatureCollection";
  features: GeoJSONFeature[];
}
