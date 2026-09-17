import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { projectService } from '../services/projectService';
import { siteService } from '../services/siteService';
import { analyticsService } from '../services/analyticsService';
import { Project } from '../types/project';
import { Site } from '../types/site';
import { GlobalSummary } from '../types/analytics';
import { GeoJSONFeatureCollection } from '../types/geo';
import { AppShell } from '../components/layout/AppShell';
import { MetricCard } from '../components/analytics/MetricCard';
import { MapboxView } from '../components/map/MapboxView';
import { ProjectCard } from '../components/projects/ProjectCard';
import { ProjectModal } from '../components/projects/ProjectModal';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import { 
  FolderKanban, 
  MapPin, 
  Maximize2, 
  Trees, 
  Plus, 
  Compass, 
  Info,
  Calendar,
  Layers
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [summary, setSummary] = useState<GlobalSummary | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [sitesGeoJSON, setSitesGeoJSON] = useState<GeoJSONFeatureCollection>({
    type: 'FeatureCollection',
    features: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [sumRes, projRes, siteRes, geoRes] = await Promise.all([
        analyticsService.getSummary(),
        projectService.getProjects(),
        siteService.getSites(),
        siteService.getSitesGeoJSON(),
      ]);

      setSummary(sumRes);
      setProjects(projRes);
      setSites(siteRes);
      setSitesGeoJSON(geoRes);
    } catch (err) {
      console.error('Failed to load dashboard metrics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleCreateProject = async (input: any) => {
    await projectService.createProject(input);
    loadDashboardData();
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Top Header Banner */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-[#0B1410] border border-[#1A2E24] rounded-2xl p-6 shadow-2xl relative overflow-hidden">
          <div className="space-y-1 z-10">
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Welcome back, <span className="text-emerald-400">{user?.name}</span>
            </h1>
            <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
              Real-time environmental intelligence platform for carbon stock monitoring, forest canopy preservation, and spatial site boundary management.
            </p>
          </div>

          <div className="flex items-center space-x-3 z-10">
            <Button
              variant="secondary"
              onClick={() => navigate('/map')}
              icon={<Compass className="w-4 h-4 text-emerald-400" />}
              className="text-xs"
            >
              Explore Full Map
            </Button>
            <Button
              variant="primary"
              onClick={() => setIsProjectModalOpen(true)}
              icon={<Plus className="w-4 h-4" />}
              className="text-xs"
            >
              Create Project
            </Button>
          </div>
        </div>

        {/* High-Level Metric Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 w-full min-w-0">
          {isLoading ? (
            Array(4)
              .fill(0)
              .map((_, i) => <Skeleton key={i} className="h-36 w-full" />)
          ) : (
            <>
              <MetricCard
                title="Total Projects"
                value={summary?.total_projects || 0}
                unit="projects"
                change="Active & Planning"
                changeType="positive"
                icon={<FolderKanban className="w-4 h-4" />}
                subtitle="User-created environmental projects."
              />
              <MetricCard
                title="Mapped Sites"
                value={summary?.total_sites || 0}
                unit="polygons"
                change="PostGIS persistent"
                changeType="positive"
                icon={<MapPin className="w-4 h-4" />}
                subtitle="Drawn site boundaries stored in PostGIS."
              />
              <MetricCard
                title="Total Mapped Area"
                value={summary?.total_mapped_area_sq_km || 0}
                unit="sq km"
                change={`${summary?.total_mapped_area_ha || 0} hectares`}
                changeType="positive"
                icon={<Maximize2 className="w-4 h-4" />}
                subtitle="Geodesic WGS84 surface area."
              />
              <MetricCard
                title="System Avg Soil Carbon"
                value={summary?.latest_carbon_metric_t_co2e || 0}
                unit="t CO2e/ha"
                change="Simulated Model Data"
                changeType="neutral"
                icon={<Trees className="w-4 h-4" />}
                subtitle="Aggregated mean across site time-series records."
              />
            </>
          )}
        </div>

        {/* Central Geospatial Map Preview */}
        <div className="bg-[#0B1410] border border-[#1A2E24] rounded-2xl p-5 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-[#1A2E24] pb-3">
            <div>
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <Compass className="w-4 h-4 text-emerald-400" />
                <span>Geospatial Project & Site Map</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Interactive spatial boundaries for all project sites rendered via Mapbox GL JS.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/map')}
              icon={<Maximize2 className="w-3.5 h-3.5" />}
              className="text-xs"
            >
              Full Screen Map
            </Button>
          </div>

          <div className="h-96 w-full rounded-xl overflow-hidden">
            <MapboxView
              sitesGeoJSON={sitesGeoJSON}
              onSelectSite={(site) => {
                if (site) navigate(`/map?siteId=${site.id}`);
              }}
              isDrawingMode={false}
              onPolygonDrawn={() => {}}
              sitesList={sites}
            />
          </div>
        </div>

        {/* Bottom Section: Recent Projects & Site Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Recent Projects */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Recent Environmental Projects</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/projects')}
                className="text-xs text-emerald-400"
              >
                View All Projects ({projects.length})
              </Button>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-48 w-full" />
              </div>
            ) : projects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projects.slice(0, 4).map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            ) : (
              <div className="bg-[#0B1410] border border-[#1A2E24] rounded-xl p-8 text-center space-y-3">
                <FolderKanban className="w-10 h-10 text-slate-500 mx-auto" />
                <h4 className="text-sm font-semibold text-slate-300">No Projects Created Yet</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Get started by creating your first carbon or biodiversity project to map geographical site boundaries.
                </p>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => setIsProjectModalOpen(true)}
                  icon={<Plus className="w-4 h-4" />}
                >
                  Create First Project
                </Button>
              </div>
            )}
          </div>

          {/* Right Col: Recent Site Activity List */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white">Recent Spatial Sites</h3>

            <div className="bg-[#0B1410] border border-[#1A2E24] rounded-xl p-4 shadow-xl space-y-3">
              {isLoading ? (
                Array(3)
                  .fill(0)
                  .map((_, i) => <Skeleton key={i} className="h-16 w-full" />)
              ) : sites.length > 0 ? (
                <div className="space-y-2.5">
                  {sites.slice(0, 5).map((site) => (
                    <div
                      key={site.id}
                      onClick={() => navigate(`/map?siteId=${site.id}`)}
                      className="p-3 bg-[#070C0A] border border-[#1A2E24] hover:border-emerald-800 rounded-lg cursor-pointer transition-all duration-150 flex items-center justify-between group"
                    >
                      <div>
                        <h4 className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">
                          {site.name}
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-0.5 flex items-center space-x-1">
                          <Layers className="w-3 h-3 text-emerald-400 inline" />
                          <span>{site.area_sq_km} sq km ({site.area_ha} ha)</span>
                        </p>
                      </div>
                      <span className="text-[10px] text-slate-500 font-medium">
                        {new Date(site.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-xs text-slate-500">
                  No site boundaries mapped yet.
                </div>
              )}
            </div>

            {/* Simulated Model Transparency Banner */}
            <div className="bg-[#070C0A] border border-emerald-900/40 rounded-xl p-4 text-xs text-slate-400 space-y-1.5">
              <div className="flex items-center space-x-2 text-emerald-400 font-semibold">
                <Info className="w-4 h-4 flex-shrink-0" />
                <span>Simulated Data Labeling</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                All carbon and biodiversity metrics in this demo are derived from generated satellite regression models and clearly labeled as sample data.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Project Creation Modal */}
      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        onSubmit={handleCreateProject}
      />
    </AppShell>
  );
};
