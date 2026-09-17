import { api } from './api';
import { AnalyticsPoint, GlobalSummary } from '../types/analytics';

export const analyticsService = {
  async getSiteAnalytics(siteId: string, metricName?: string): Promise<AnalyticsPoint[]> {
    const params: Record<string, string> = {};
    if (metricName) params.metric_name = metricName;

    const res = await api.get<AnalyticsPoint[]>(`/sites/${siteId}/analytics`, { params });
    return res.data;
  },

  async getSummary(): Promise<GlobalSummary> {
    const res = await api.get<GlobalSummary>('/analytics/summary');
    return res.data;
  },

  getExportCSVUrl(siteId: string): string {
    const token = localStorage.getItem('darukaa_token') || '';
    const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api/v1';
    return `${baseUrl}/sites/${siteId}/export/csv?token=${encodeURIComponent(token)}`;
  },

  getExportGeoJSONUrl(siteId: string): string {
    const token = localStorage.getItem('darukaa_token') || '';
    const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api/v1';
    return `${baseUrl}/sites/${siteId}/export/geojson?token=${encodeURIComponent(token)}`;
  }
};
