import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectService } from '../services/projectService';
import { siteService } from '../services/siteService';
import { Project } from '../types/project';
import { Site } from '../types/site';
import { GeoJSONFeatureCollection } from '../types/geo';
import { AppShell } from '../components/layout/AppShell';
import { MapboxView } from '../components/map/MapboxView';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import { useToast } from '../context/ToastContext';
import { 
  FolderKanban, 
  MapPin, 
  Layers, 
  Plus, 
  Calendar, 
  ArrowLeft, 
  Trash2, 
  Edit,
  Maximize2
} from 'lucide-react';

export const ProjectDetail: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [project, setProject] = useState<Project | null>(null);
  const [sites, setSites] = useState<Site[]>([]);
  const [sitesGeoJSON, setSitesGeoJSON] = useState<GeoJSONFeatureCollection>({
    type: 'FeatureCollection',
    features: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  const loadProjectData = async () => {
    if (!projectId) return;
    setIsLoading(true);
    try {
      const [projRes, siteListRes, geoRes] = await Promise.all([
        projectService.getProject(projectId),
        siteService.getProjectSites(projectId),
        siteService.getSitesGeoJSON(projectId),
      ]);

      setProject(projRes);
      setSites(siteListRes);
      setSitesGeoJSON(geoRes);
    } catch (err: any) {
      console.error('Failed to load project details:', err);
      showToast('Project not found or access denied', 'error');
      navigate('/projects');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProjectData();
  }, [projectId]);

  const handleDeleteSite = async (siteId: string) => {
    if (window.confirm('Delete this site polygon from PostGIS?')) {
      try {
        await siteService.deleteSite(siteId);
        showToast('Site deleted successfully', 'success');
        loadProjectData();
      } catch (err: any) {
        showToast('Failed to delete site', 'error');
      }
    }
  };

  if (isLoading) {
    return (
      <AppShell>
        <div className="space-y-6">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </AppShell>
    );
  }

  if (!project) return null;

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Back Link & Header */}
        <div className="flex items-center space-x-3 text-xs text-slate-400">
          <button
            onClick={() => navigate('/projects')}
            className="flex items-center space-x-1 hover:text-emerald-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Projects</span>
          </button>
        </div>

        {/* Project Header Banner */}
        <div className="bg-[#0B1410] border border-[#1A2E24] rounded-2xl p-6 shadow-2xl space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Badge variant="emerald">{project.category}</Badge>
                <Badge variant={project.status === 'Active' ? 'lime' : 'amber'}>{project.status}</Badge>
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">{project.name}</h1>
              <p className="text-xs text-slate-400 mt-1 flex items-center space-x-1">
                <MapPin className="w-4 h-4 text-emerald-400" />
                <span>{project.region}</span>
              </p>
            </div>

            <Button
              variant="primary"
              onClick={() => navigate(`/map?projectId=${project.id}&draw=true`)}
              icon={<Plus className="w-4 h-4" />}
            >
              Add Site (Draw Polygon)
            </Button>
          </div>

          {project.description && (
            <p className="text-xs text-slate-300 leading-relaxed max-w-3xl pt-2 border-t border-[#1A2E24]/60">
              {project.description}
            </p>
          )}

          {/* Metrics summary bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-[#1A2E24]">
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-medium">Mapped Sites</span>
              <span className="text-sm font-bold text-white">{sites.length} sites</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-medium">Total Area</span>
              <span className="text-sm font-bold text-white">{project.total_area_sq_km} sq km</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-medium">Start Date</span>
              <span className="text-sm font-bold text-white">{project.start_date}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-medium">Created At</span>
              <span className="text-sm font-bold text-white">
                {new Date(project.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Project Spatial Map & Sites Table Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map View (2 Cols) */}
          <div className="lg:col-span-2 bg-[#0B1410] border border-[#1A2E24] rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#1A2E24] pb-3">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                <span>Project Site Boundaries</span>
              </h3>
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate(`/map?projectId=${project.id}`)}
                icon={<Maximize2 className="w-3.5 h-3.5" />}
                className="text-xs"
              >
                Expand Map
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

          {/* Sites List Table (1 Col) */}
          <div className="bg-[#0B1410] border border-[#1A2E24] rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#1A2E24] pb-3">
              <h3 className="text-sm font-bold text-white">Project Sites ({sites.length})</h3>
              <Button
                size="sm"
                variant="primary"
                onClick={() => navigate(`/map?projectId=${project.id}&draw=true`)}
                icon={<Plus className="w-3.5 h-3.5" />}
                className="text-xs"
              >
                Draw Site
              </Button>
            </div>

            {sites.length > 0 ? (
              <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                {sites.map((site) => (
                  <div
                    key={site.id}
                    className="p-3 bg-[#070C0A] border border-[#1A2E24] hover:border-emerald-800 rounded-xl transition-all duration-150 flex items-center justify-between group"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">
                        {site.name}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {site.area_sq_km} sq km ({site.area_ha} ha)
                      </p>
                    </div>

                    <div className="flex items-center space-x-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => navigate(`/map?siteId=${site.id}`)}
                        className="text-xs text-emerald-400"
                      >
                        Inspect
                      </Button>
                      <button
                        onClick={() => handleDeleteSite(site.id)}
                        className="p-1.5 text-slate-400 hover:text-red-400 rounded-md hover:bg-red-950/20"
                        title="Delete Site"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-xs text-slate-500 space-y-2">
                <Layers className="w-8 h-8 text-slate-600 mx-auto" />
                <p>No site polygons drawn for this project yet.</p>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => navigate(`/map?projectId=${project.id}&draw=true`)}
                  icon={<Plus className="w-3.5 h-3.5" />}
                >
                  Add First Site
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
};
