import { api } from './api';
import { Site, SiteCreateInput } from '../types/site';
import { GeoJSONFeatureCollection } from '../types/geo';

export const siteService = {
  async getSites(projectId?: string): Promise<Site[]> {
    const params = projectId ? { project_id: projectId } : {};
    const res = await api.get<Site[]>('/sites', { params });
    return res.data;
  },

  async getSitesGeoJSON(projectId?: string): Promise<GeoJSONFeatureCollection> {
    const params = projectId ? { project_id: projectId } : {};
    const res = await api.get<GeoJSONFeatureCollection>('/sites/geojson', { params });
    return res.data;
  },

  async getProjectSites(projectId: string): Promise<Site[]> {
    const res = await api.get<Site[]>(`/projects/${projectId}/sites`);
    return res.data;
  },

  async createSite(projectId: string, input: SiteCreateInput): Promise<Site> {
    const res = await api.post<Site>(`/projects/${projectId}/sites`, input);
    return res.data;
  },

  async getSite(id: string): Promise<Site> {
    const res = await api.get<Site>(`/sites/${id}`);
    return res.data;
  },

  async updateSite(id: string, input: Partial<SiteCreateInput>): Promise<Site> {
    const res = await api.put<Site>(`/sites/${id}`, input);
    return res.data;
  },

  async deleteSite(id: string): Promise<void> {
    await api.delete(`/sites/${id}`);
  }
};
