import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { projectService } from '../services/projectService';
import { siteService } from '../services/siteService';
import { Project } from '../types/project';
import { Site } from '../types/site';
import { GeoJSONFeatureCollection, GeoJSONGeometry } from '../types/geo';
import { AppShell } from '../components/layout/AppShell';
import { MapboxView } from '../components/map/MapboxView';
import { MapToolbar } from '../components/map/MapToolbar';
import { SiteDrawer } from '../components/map/SiteDrawer';
import { SiteModal } from '../components/projects/SiteModal';
import { ProjectModal } from '../components/projects/ProjectModal';
import { useToast } from '../context/ToastContext';

export const MapPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialProjectId = searchParams.get('projectId') || '';
  const initialSiteId = searchParams.get('siteId') || '';
  const initialDraw = searchParams.get('draw') === 'true';

  const { showToast } = useToast();

  const [projects, setProjects] = useState<Project[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [sitesGeoJSON, setSitesGeoJSON] = useState<GeoJSONFeatureCollection>({
    type: 'FeatureCollection',
    features: [],
  });

  const [selectedProjectId, setSelectedProjectId] = useState<string>(initialProjectId);
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);

  const [isDrawingMode, setIsDrawingMode] = useState<boolean>(initialDraw);
  const [drawnGeometry, setDrawnGeometry] = useState<GeoJSONGeometry | null>(null);
  const [calculatedAreaSqKm, setCalculatedAreaSqKm] = useState<number>(0);
  const [isSiteModalOpen, setIsSiteModalOpen] = useState<boolean>(false);

  const [isProjectModalOpen, setIsProjectModalOpen] = useState<boolean>(false);
  const [mapStyle, setMapStyle] = useState<'satellite' | 'dark'>('dark');

  const loadData = async () => {
    try {
      const [projList, siteList, geoData] = await Promise.all([
        projectService.getProjects(),
        siteService.getSites(selectedProjectId || undefined),
        siteService.getSitesGeoJSON(selectedProjectId || undefined),
      ]);

      setProjects(projList);
      setSites(siteList);
      setSitesGeoJSON(geoData);

      if (initialSiteId) {
        const found = siteList.find((s) => s.id === initialSiteId);
        if (found) setSelectedSite(found);
      }
    } catch (err) {
      console.error('Failed to load map data:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedProjectId]);

  const handlePolygonDrawn = (geometry: GeoJSONGeometry, areaSqKm: number) => {
    setDrawnGeometry(geometry);
    setCalculatedAreaSqKm(areaSqKm);
    setIsSiteModalOpen(true);
  };

  const handleSaveSite = async (
    projectId: string,
    name: string,
    description: string,
    geometry: GeoJSONGeometry
  ) => {
    try {
      const newSite = await siteService.createSite(projectId, {
        name,
        description,
        geometry,
      });

      showToast(`Site "${name}" saved to PostGIS! (${newSite.area_sq_km} sq km)`, 'success');
      setIsDrawingMode(false);
      setDrawnGeometry(null);
      setIsSiteModalOpen(false);

      // Reload map data
      await loadData();
      setSelectedSite(newSite);
    } catch (err: any) {
      showToast(err.response?.data?.detail || 'Failed to save site polygon', 'error');
      throw err;
    }
  };

  const handleDeleteSite = async (siteId: string) => {
    try {
      await siteService.deleteSite(siteId);
      showToast('Site deleted successfully from PostGIS', 'success');
      setSelectedSite(null);
      loadData();
    } catch (err) {
      showToast('Failed to delete site', 'error');
    }
  };

  const handleCreateProject = async (input: any) => {
    const newProj = await projectService.createProject(input);
    showToast(`Project "${newProj.name}" created!`, 'success');
    loadData();
    setSelectedProjectId(newProj.id);
  };

  return (
    <AppShell>
      <div className="h-[calc(100vh-7rem)] flex flex-col space-y-3 relative">
        {/* Floating Toolbar */}
        <MapToolbar
          projects={projects}
          selectedProjectId={selectedProjectId}
          onSelectProject={(id) => {
            setSelectedProjectId(id);
            setSearchParams(id ? { projectId: id } : {});
          }}
          isDrawing={isDrawingMode}
          onStartDrawing={() => setIsDrawingMode(true)}
          onCancelDrawing={() => setIsDrawingMode(false)}
          mapStyle={mapStyle}
          onToggleMapStyle={(style) => setMapStyle(style)}
          onOpenCreateProjectModal={() => setIsProjectModalOpen(true)}
        />

        {/* Mapbox Canvas */}
        <div className="flex-1 w-full rounded-xl overflow-hidden relative">
          <MapboxView
            sitesGeoJSON={sitesGeoJSON}
            selectedSiteId={selectedSite?.id}
            onSelectSite={(site) => setSelectedSite(site)}
            isDrawingMode={isDrawingMode}
            onPolygonDrawn={handlePolygonDrawn}
            mapStyle={mapStyle}
            sitesList={sites}
          />

          {/* Slide-over Site Details Drawer */}
          <SiteDrawer
            site={selectedSite}
            onClose={() => setSelectedSite(null)}
            onDelete={handleDeleteSite}
          />
        </div>
      </div>

      {/* Save Site Polygon Modal */}
      <SiteModal
        isOpen={isSiteModalOpen}
        onClose={() => {
          setIsSiteModalOpen(false);
          setIsDrawingMode(false);
        }}
        onSubmit={handleSaveSite}
        drawnGeometry={drawnGeometry}
        calculatedAreaSqKm={calculatedAreaSqKm}
        projects={projects}
        defaultProjectId={selectedProjectId}
      />

      {/* Create Project Modal */}
      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        onSubmit={handleCreateProject}
      />
    </AppShell>
  );
};
