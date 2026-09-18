import React, { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import area from '@turf/area';
import kinks from '@turf/kinks';
import { GeoJSONFeatureCollection, GeoJSONGeometry } from '../../types/geo';
import { Site } from '../../types/site';
import { MapLegend } from './MapLegend';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface MapboxViewProps {
  sitesGeoJSON: GeoJSONFeatureCollection;
  selectedSiteId?: string;
  onSelectSite: (site: Site | null) => void;
  isDrawingMode: boolean;
  onPolygonDrawn: (geometry: GeoJSONGeometry, calculatedAreaSqKm: number) => void;
  mapStyle?: 'satellite' | 'dark';
  sitesList?: Site[];
}

export const MapboxView: React.FC<MapboxViewProps> = ({
  sitesGeoJSON,
  selectedSiteId,
  onSelectSite,
  isDrawingMode,
  onPolygonDrawn,
  mapStyle = 'dark',
  sitesList = [],
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const drawRef = useRef<MapboxDraw | null>(null);

  const [liveDrawingArea, setLiveDrawingArea] = useState<{ sqKm: number; ha: number } | null>(null);
  const [geometryError, setGeometryError] = useState<string | null>(null);

  const roundVal = useCallback((val: number, decimals: number) => {
    const factor = Math.pow(10, decimals);
    return Math.round(val * factor) / factor;
  }, []);

  // ─── Fit bounds helper ────────────────────────────────────────────────
  const fitMapToBounds = useCallback(
    (map: mapboxgl.Map, geojson: GeoJSONFeatureCollection) => {
      try {
        const bounds = new mapboxgl.LngLatBounds();
        let hasCoords = false;
        geojson.features.forEach((feat) => {
          if (feat.geometry && feat.geometry.coordinates) {
            const ring = feat.geometry.coordinates[0];
            ring.forEach((coord: any) => {
              if (Array.isArray(coord) && coord.length >= 2) {
                bounds.extend(coord as [number, number]);
                hasCoords = true;
              }
            });
          }
        });
        if (hasCoords && !bounds.isEmpty()) {
          map.fitBounds(bounds, { padding: 60, maxZoom: 13, duration: 1000 });
        }
      } catch (e) {
        console.error('Fit bounds error:', e);
      }
    },
    []
  );

  const [runtimeToken, setRuntimeToken] = useState<string>(() => {
    const local = (localStorage.getItem('darukaa_mapbox_token') || '').trim();
    if (local && local.startsWith('pk.') && !local.includes('example')) {
      return local;
    }
    return (import.meta.env.VITE_MAPBOX_TOKEN || '').trim();
  });

  // Fetch token from backend runtime config if not baked into Vite bundle or localStorage
  useEffect(() => {
    if (!runtimeToken || !runtimeToken.startsWith('pk.') || runtimeToken.includes('example')) {
      const rawBase = (import.meta.env.VITE_API_BASE_URL || '/api/v1').replace(/\/+$/, '');
      const apiUrl = rawBase.endsWith('/api/v1') ? rawBase : `${rawBase}/api/v1`;
      fetch(`${apiUrl}/health/config`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && data.mapbox_token && data.mapbox_token.startsWith('pk.')) {
            setRuntimeToken(data.mapbox_token);
          }
        })
        .catch(() => {});
    }
  }, [runtimeToken]);

  // ─── Initialize Map ───────────────────────────────────────────────────
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const token = runtimeToken;
    const hasValidToken = Boolean(token && token.startsWith('pk.') && !token.includes('example'));

    if (!hasValidToken) {
      return;
    }

    mapboxgl.accessToken = token;

    const styleUrl =
      mapStyle === 'satellite'
        ? 'mapbox://styles/mapbox/satellite-streets-v12'
        : 'mapbox://styles/mapbox/dark-v11';

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: styleUrl,
      center: [76.13, 11.61], // Western Ghats default
      zoom: 9.5,
      pitch: 20,
    });




    // Navigation controls
    map.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), 'top-right');

    // Mapbox Draw plugin for polygon drawing
    const draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: { polygon: true, trash: true },
      styles: [
        {
          id: 'gl-draw-polygon-fill-inactive',
          type: 'fill',
          filter: ['all', ['==', '$type', 'Polygon'], ['!=', 'mode', 'static']],
          paint: { 'fill-color': '#10B981', 'fill-opacity': 0.35 },
        },
        {
          id: 'gl-draw-polygon-fill-active',
          type: 'fill',
          filter: ['all', ['==', '$type', 'Polygon'], ['==', 'active', 'true']],
          paint: { 'fill-color': '#34D399', 'fill-opacity': 0.5 },
        },
        {
          id: 'gl-draw-polygon-stroke-inactive',
          type: 'line',
          filter: ['all', ['==', '$type', 'Polygon'], ['!=', 'mode', 'static']],
          layout: { 'line-cap': 'round', 'line-join': 'round' },
          paint: { 'line-color': '#10B981', 'line-width': 2.5 },
        },
        {
          id: 'gl-draw-polygon-stroke-active',
          type: 'line',
          filter: ['all', ['==', '$type', 'Polygon'], ['==', 'active', 'true']],
          layout: { 'line-cap': 'round', 'line-join': 'round' },
          paint: { 'line-color': '#A3E635', 'line-width': 3.5, 'line-dasharray': [2, 2] },
        },
        {
          id: 'gl-draw-polygon-and-line-vertex-active',
          type: 'circle',
          filter: ['all', ['==', 'meta', 'vertex'], ['==', '$type', 'Point'], ['!=', 'mode', 'static']],
          paint: {
            'circle-radius': 6,
            'circle-color': '#A3E635',
            'circle-stroke-width': 2,
            'circle-stroke-color': '#070C0A',
          },
        },
      ],
    });

    map.addControl(draw as any, 'top-left');
    drawRef.current = draw;
    mapRef.current = map;

    // Resize after mount to fill container
    setTimeout(() => map.resize(), 300);

    // ── After style loads, add site GeoJSON layers ───────────────────
    map.on('load', () => {
      // Add GeoJSON source
      map.addSource('sites-source', {
        type: 'geojson',
        data: sitesGeoJSON as any,
      });

      // Polygon fills coloured by project category
      map.addLayer({
        id: 'sites-fill',
        type: 'fill',
        source: 'sites-source',
        paint: {
          'fill-color': [
            'match',
            ['get', 'project_category'],
            'Biodiversity Conservation', '#10B981',
            'Forest Restoration', '#A3E635',
            'Reforestation', '#38BDF8',
            'Ecosystem Monitoring', '#F59E0B',
            '#A855F7',
          ],
          'fill-opacity': 0.4,
        },
      });

      // Polygon outlines
      map.addLayer({
        id: 'sites-outline',
        type: 'line',
        source: 'sites-source',
        paint: { 'line-color': '#34D399', 'line-width': 2.5 },
      });

      // Selected polygon highlight
      map.addLayer({
        id: 'sites-selected',
        type: 'line',
        source: 'sites-source',
        filter: ['==', 'id', selectedSiteId || ''],
        paint: { 'line-color': '#A3E635', 'line-width': 4.5 },
      });

      // Hover popup
      const popup = new mapboxgl.Popup({ closeButton: false, closeOnClick: false });

      map.on('mouseenter', 'sites-fill', (e) => {
        map.getCanvas().style.cursor = 'pointer';
        if (e.features && e.features[0] && e.features[0].properties) {
          const props = e.features[0].properties;
          popup
            .setLngLat(e.lngLat)
            .setHTML(
              `<div class="text-xs">
                <div class="font-bold text-white">${props.name || 'Site'}</div>
                <div class="text-emerald-400 font-medium">${props.area_sq_km || 0} sq km (${props.area_ha || 0} ha)</div>
                <div class="text-[10px] text-slate-400 mt-1">${props.project_name || ''}</div>
              </div>`
            )
            .addTo(map);
        }
      });

      map.on('mouseleave', 'sites-fill', () => {
        map.getCanvas().style.cursor = '';
        popup.remove();
      });

      // Click polygon to select site
      map.on('click', 'sites-fill', (e) => {
        if (e.features && e.features[0]) {
          const siteId = e.features[0].properties?.id;
          const targetSite = sitesList.find((s) => s.id === siteId);
          if (targetSite) onSelectSite(targetSite);
        }
      });

      // Fit bounds to existing polygons
      if (sitesGeoJSON.features && sitesGeoJSON.features.length > 0) {
        fitMapToBounds(map, sitesGeoJSON);
      }
    });

    // ── Polygon draw events ─────────────────────────────────────────
    const handleDrawChange = () => {
      const data = draw.getAll();
      if (data.features.length > 0) {
        const feature = data.features[data.features.length - 1];

        const kinkResults = kinks(feature as any);
        if (kinkResults.features.length > 0) {
          setGeometryError('Self-intersecting boundary loop detected! Adjust vertices.');
        } else {
          setGeometryError(null);
        }

        const areaInSqMeters = area(feature as any);
        const sqKm = roundVal(areaInSqMeters / 1_000_000, 4);
        const ha = roundVal(sqKm * 100, 2);
        setLiveDrawingArea({ sqKm, ha });

        if (kinkResults.features.length === 0 && feature.geometry) {
          onPolygonDrawn(feature.geometry as GeoJSONGeometry, sqKm);
        }
      } else {
        setLiveDrawingArea(null);
        setGeometryError(null);
      }
    };

    map.on('draw.create', handleDrawChange);
    map.on('draw.update', handleDrawChange);
    map.on('draw.delete', () => {
      setLiveDrawingArea(null);
      setGeometryError(null);
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapStyle, runtimeToken]);


  // ─── Update GeoJSON source when sites change ──────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    const source = map.getSource('sites-source') as mapboxgl.GeoJSONSource | undefined;
    if (source) {
      source.setData(sitesGeoJSON as any);
      if (sitesGeoJSON.features && sitesGeoJSON.features.length > 0) {
        fitMapToBounds(map, sitesGeoJSON);
      }
    }
  }, [sitesGeoJSON, fitMapToBounds]);

  // ─── Highlight selected site ──────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded() || !map.getLayer('sites-selected')) return;
    map.setFilter('sites-selected', ['==', 'id', selectedSiteId || '']);

    if (selectedSiteId && sitesGeoJSON.features) {
      const feat = sitesGeoJSON.features.find((f) => f.properties?.id === selectedSiteId);
      if (feat && feat.geometry && feat.geometry.coordinates) {
        const ring = feat.geometry.coordinates[0];
        if (ring && ring.length > 0) {
          const bounds = ring.reduce(
            (b: mapboxgl.LngLatBounds, c: any) => b.extend(c as [number, number]),
            new mapboxgl.LngLatBounds(ring[0] as [number, number], ring[0] as [number, number])
          );
          map.fitBounds(bounds, { padding: 80, maxZoom: 14, duration: 1000 });
        }
      }
    }
  }, [selectedSiteId, sitesGeoJSON]);

  // ─── Toggle drawing mode ──────────────────────────────────────────
  useEffect(() => {
    if (drawRef.current) {
      if (isDrawingMode) {
        drawRef.current.changeMode('draw_polygon');
      } else {
        drawRef.current.deleteAll();
        drawRef.current.changeMode('simple_select');
        setLiveDrawingArea(null);
        setGeometryError(null);
      }
    }
  }, [isDrawingMode]);

  const isTokenMissing =
    !runtimeToken || !runtimeToken.startsWith('pk.') || runtimeToken.includes('example');


  // ─── JSX ──────────────────────────────────────────────────────────
  return (
    <div className="relative w-full h-full min-h-[480px] rounded-xl overflow-hidden border border-[#1A2E24] shadow-2xl bg-[#070C0A]">
      {/* Map canvas */}
      <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />

      {/* Missing Token Fallback Overlay */}
      {isTokenMissing && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 text-center bg-[#070C0A]/90 backdrop-blur-sm">
          <div className="max-w-md p-6 rounded-2xl bg-[#0B1410] border border-amber-500/40 shadow-2xl space-y-4">
            <div className="w-12 h-12 mx-auto rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Mapbox Token Required</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              To render satellite tiles and interactive geometry editing, configure <code className="px-1.5 py-0.5 rounded bg-black/50 text-amber-400 font-mono">VITE_MAPBOX_TOKEN</code> in your Vercel project settings.
            </p>
          </div>
        </div>
      )}


      {/* Live drawing feedback banner */}
      {isDrawingMode && (
        <div className="absolute top-4 left-4 z-20 bg-[#0B1410]/95 backdrop-blur-md border border-emerald-500/50 rounded-xl p-3.5 shadow-2xl text-xs space-y-2 max-w-sm animate-fade-in">
          <div className="flex items-center space-x-2 text-emerald-400 font-semibold text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Polygon Drawing Mode Active</span>
          </div>
          <p className="text-slate-300 text-[11px]">
            Click on the map to place boundary vertices. Click the starting vertex to complete the polygon.
          </p>

          {liveDrawingArea && (
            <div className="bg-[#070C0A] border border-emerald-800/60 rounded-lg p-2 flex items-center justify-between">
              <span className="text-slate-400">Live Geodesic Area:</span>
              <span className="text-emerald-300 font-bold text-sm">
                {liveDrawingArea.sqKm} sq km ({liveDrawingArea.ha} ha)
              </span>
            </div>
          )}

          {geometryError && (
            <div className="bg-red-950/80 border border-red-500/50 rounded-lg p-2 text-red-300 text-[11px] flex items-center space-x-1.5">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span>{geometryError}</span>
            </div>
          )}
        </div>
      )}

      {/* Map category colour legend */}
      <div className="absolute bottom-6 left-4 z-20">
        <MapLegend />
      </div>
    </div>
  );
};
