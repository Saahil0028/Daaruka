import { GeoJSONGeometry } from './geo';

export interface Site {
  id: string;
  project_id: string;
  name: string;
  description?: string;
  geometry: GeoJSONGeometry;
  area_sq_km: number;
  area_ha: number;
  created_at: string;
  updated_at: string;
}

export interface SiteCreateInput {
  name: string;
  description?: string;
  geometry: GeoJSONGeometry;
}
