export interface Project {
  id: string;
  owner_id: string;
  name: string;
  description?: string;
  category: 'Forest Restoration' | 'Biodiversity Conservation' | 'Ecosystem Monitoring' | 'Reforestation' | 'Other';
  region: string;
  status: 'Planning' | 'Active' | 'Completed' | 'Archived';
  start_date: string;
  end_date?: string;
  sites_count: number;
  total_area_sq_km: number;
  created_at: string;
  updated_at: string;
}

export interface ProjectCreateInput {
  name: string;
  description?: string;
  category: string;
  region: string;
  status?: string;
  start_date: string;
  end_date?: string;
}
