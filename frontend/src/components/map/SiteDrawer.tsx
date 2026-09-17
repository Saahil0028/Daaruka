import React, { useState, useEffect } from 'react';
import { Site } from '../../types/site';
import { AnalyticsPoint } from '../../types/analytics';
import { analyticsService } from '../../services/analyticsService';
import { TimeSeriesChart } from '../analytics/TimeSeriesChart';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { X, Download, Trash2, Edit, MapPin, Calendar, Compass, FileSpreadsheet, Layers } from 'lucide-react';

interface SiteDrawerProps {
  site: Site | null;
  onClose: () => void;
  onEdit?: (site: Site) => void;
  onDelete?: (siteId: string) => void;
}

export const SiteDrawer: React.FC<SiteDrawerProps> = ({
  site,
  onClose,
  onEdit,
  onDelete
}) => {
  const [analytics, setAnalytics] = useState<AnalyticsPoint[]>([]);
  const [activeTab, setActiveTab] = useState<'carbon' | 'canopy' | 'ndvi'>('carbon');
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (site) {
      setIsLoading(true);
      analyticsService
        .getSiteAnalytics(site.id)
        .then((data) => setAnalytics(data))
        .catch((err) => console.error('Failed to fetch site analytics:', err))
        .finally(() => setIsLoading(false));
    }
  }, [site]);

  if (!site) return null;

  const vertexCount = site.geometry?.coordinates?.[0]?.length || 0;

  return (
    <aside className="fixed right-0 top-0 bottom-0 w-full sm:w-[480px] bg-[#0B1410] border-l border-[#1A2E24] shadow-2xl z-50 flex flex-col animate-slide-left">
      {/* Drawer Header */}
      <div className="p-5 border-b border-[#1A2E24] flex items-start justify-between bg-[#070C0A]/60">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-bold text-white tracking-tight">{site.name}</h3>
            <Badge variant="emerald">{site.area_sq_km} sq km</Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1 flex items-center space-x-1">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span>Site ID: {site.id.substring(0, 8)}...</span>
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-[#1A2E24] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#070C0A] border border-[#1A2E24] rounded-xl p-3">
            <span className="text-[11px] text-slate-400 block uppercase font-medium">Calculated Area</span>
            <div className="mt-1 flex items-baseline space-x-1">
              <span className="text-lg font-bold text-white">{site.area_sq_km}</span>
              <span className="text-xs text-emerald-400 font-medium">sq km</span>
            </div>
            <span className="text-[10px] text-slate-500 mt-0.5 block">({site.area_ha} hectares)</span>
          </div>

          <div className="bg-[#070C0A] border border-[#1A2E24] rounded-xl p-3">
            <span className="text-[11px] text-slate-400 block uppercase font-medium">Polygon Geometry</span>
            <div className="mt-1 flex items-baseline space-x-1">
              <span className="text-lg font-bold text-white">{vertexCount}</span>
              <span className="text-xs text-emerald-400 font-medium">vertices</span>
            </div>
            <span className="text-[10px] text-slate-500 mt-0.5 block">PostGIS EPSG:4326</span>
          </div>
        </div>

        {/* Site Description */}
        {site.description && (
          <div className="bg-[#122019] border border-[#1A2E24] rounded-xl p-3.5 text-xs text-slate-300">
            <span className="font-semibold text-white block mb-1">Description</span>
            <p className="leading-relaxed">{site.description}</p>
          </div>
        )}

        {/* Analytics Tabs & Chart */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-[#1A2E24] pb-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Site Performance & Metrics
            </h4>
            <div className="flex items-center space-x-1 bg-[#070C0A] border border-[#1A2E24] rounded-lg p-0.5">
              <button
                onClick={() => setActiveTab('carbon')}
                className={`px-2 py-0.5 text-xs font-medium rounded transition-colors ${
                  activeTab === 'carbon' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Soil Carbon
              </button>
              <button
                onClick={() => setActiveTab('canopy')}
                className={`px-2 py-0.5 text-xs font-medium rounded transition-colors ${
                  activeTab === 'canopy' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Canopy
              </button>
              <button
                onClick={() => setActiveTab('ndvi')}
                className={`px-2 py-0.5 text-xs font-medium rounded transition-colors ${
                  activeTab === 'ndvi' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                NDVI
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="h-56 bg-[#070C0A] border border-[#1A2E24] rounded-xl flex items-center justify-center text-xs text-slate-400 animate-pulse">
              Loading site time-series metrics...
            </div>
          ) : activeTab === 'carbon' ? (
            <TimeSeriesChart
              analytics={analytics}
              metricName="soil_carbon_density"
              unit="t CO2e/ha"
              title="Soil Carbon Stock Density"
            />
          ) : activeTab === 'canopy' ? (
            <TimeSeriesChart
              analytics={analytics}
              metricName="canopy_cover_pct"
              unit="%"
              title="Canopy Closure Density"
            />
          ) : (
            <TimeSeriesChart
              analytics={analytics}
              metricName="ndvi_index"
              unit="index (0-1)"
              title="Normalized Vegetation Index (NDVI)"
            />
          )}
        </div>

        {/* Data Provenance Notice */}
        <div className="bg-[#070C0A] border border-emerald-900/30 rounded-xl p-3 text-[11px] text-slate-400 leading-relaxed">
          <span className="font-semibold text-emerald-400 block mb-0.5">Data Provenance & Transparency</span>
          Calculated geodesic area derived from PostGIS <code className="text-emerald-300">ST_Area(geom::geography)</code>. Time-series metrics are simulated models for hackathon demonstration.
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-[#1A2E24] bg-[#070C0A] flex items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <a
            href={analyticsService.getExportCSVUrl(site.id)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center space-x-1 px-3 py-1.5 bg-[#122019] hover:bg-[#1A2E24] border border-[#1A2E24] text-slate-200 text-xs rounded-lg transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>CSV</span>
          </a>
          <a
            href={analyticsService.getExportGeoJSONUrl(site.id)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center space-x-1 px-3 py-1.5 bg-[#122019] hover:bg-[#1A2E24] border border-[#1A2E24] text-slate-200 text-xs rounded-lg transition-colors"
          >
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            <span>GeoJSON</span>
          </a>
        </div>

        <div className="flex items-center space-x-2">
          {onEdit && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEdit(site)}
              icon={<Edit className="w-3.5 h-3.5" />}
              className="text-xs"
            >
              Edit
            </Button>
          )}

          {onDelete && (
            showDeleteConfirm ? (
              <div className="flex items-center space-x-1">
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => onDelete(site.id)}
                  className="text-xs"
                >
                  Confirm Delete
                </Button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-2 py-1 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowDeleteConfirm(true)}
                icon={<Trash2 className="w-3.5 h-3.5 text-red-400" />}
                className="text-xs text-red-400 hover:bg-red-950/20"
              >
                Delete
              </Button>
            )
          )}
        </div>
      </div>
    </aside>
  );
};
