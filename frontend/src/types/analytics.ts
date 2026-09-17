export interface AnalyticsPoint {
  id: string;
  site_id: string;
  metric_name: 'soil_carbon_density' | 'canopy_cover_pct' | 'ndvi_index' | 'biodiversity_score';
  metric_value: number;
  unit: string;
  recorded_at: string;
  data_source: string;
  is_simulated: boolean;
}

export interface GlobalSummary {
  total_projects: number;
  total_sites: number;
  total_mapped_area_sq_km: number;
  total_mapped_area_ha: number;
  latest_carbon_metric_t_co2e: number;
  simulated_notice: string;
}
