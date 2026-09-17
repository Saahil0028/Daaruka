import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { siteService } from '../services/siteService';
import { analyticsService } from '../services/analyticsService';
import { Site } from '../types/site';
import { AnalyticsPoint } from '../types/analytics';
import { AppShell } from '../components/layout/AppShell';
import { TimeSeriesChart } from '../components/analytics/TimeSeriesChart';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';
import { ArrowLeft, Layers, FileSpreadsheet, Download, MapPin, Compass, Trash2 } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export const SiteDetail: React.FC = () => {
  const { siteId } = useParams<{ siteId: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [site, setSite] = useState<Site | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!siteId) return;
    setIsLoading(true);
    Promise.all([
      siteService.getSite(siteId),
      analyticsService.getSiteAnalytics(siteId),
    ])
      .then(([sRes, aRes]) => {
        setSite(sRes);
        setAnalytics(aRes);
      })
      .catch((err) => {
        console.error('Failed to load site details:', err);
        showToast('Site not found', 'error');
        navigate('/map');
      })
      .finally(() => setIsLoading(false));
  }, [siteId]);

  if (isLoading) {
    return (
      <AppShell>
        <div className="space-y-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </AppShell>
    );
  }

  if (!site) return null;

  return (
    <AppShell>
      <div className="space-y-6">
        <button
          onClick={() => navigate('/map')}
          className="flex items-center space-x-1 text-xs text-slate-400 hover:text-emerald-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Explore Map</span>
        </button>

        {/* Site Header Banner */}
        <div className="bg-[#0B1410] border border-[#1A2E24] rounded-2xl p-6 shadow-2xl flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Badge variant="emerald">{site.area_sq_km} sq km</Badge>
              <Badge variant="lime">{site.area_ha} hectares</Badge>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">{site.name}</h1>
            <p className="text-xs text-slate-400 mt-1 flex items-center space-x-1">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span>PostGIS Polygon Boundary ID: {site.id}</span>
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <a
              href={analyticsService.getExportCSVUrl(site.id)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-[#122019] hover:bg-[#1A2E24] border border-[#1A2E24] text-slate-200 text-xs font-medium rounded-lg transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Export CSV</span>
            </a>
            <a
              href={analyticsService.getExportGeoJSONUrl(site.id)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-[#122019] hover:bg-[#1A2E24] border border-[#1A2E24] text-slate-200 text-xs font-medium rounded-lg transition-colors"
            >
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>Export GeoJSON</span>
            </a>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/map?siteId=${site.id}`)}
              icon={<Compass className="w-4 h-4" />}
              className="text-xs"
            >
              View on Map
            </Button>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TimeSeriesChart
            analytics={analytics}
            metricName="soil_carbon_density"
            unit="t CO2e/ha"
            title="Soil Carbon Stock Density Over Time"
          />
          <TimeSeriesChart
            analytics={analytics}
            metricName="canopy_cover_pct"
            unit="%"
            title="Canopy Closure Density Over Time"
          />
        </div>

        <TimeSeriesChart
          analytics={analytics}
          metricName="ndvi_index"
          unit="index (0-1)"
          title="Normalized Difference Vegetation Index (NDVI)"
        />
      </div>
    </AppShell>
  );
};
