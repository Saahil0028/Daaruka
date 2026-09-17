import React from 'react';
import { Project } from '../../types/project';
import { Button } from '../ui/Button';
import { PenTool, X, Filter, Layers, Plus } from 'lucide-react';

interface MapToolbarProps {
  projects: Project[];
  selectedProjectId: string;
  onSelectProject: (id: string) => void;
  isDrawing: boolean;
  onStartDrawing: () => void;
  onCancelDrawing: () => void;
  mapStyle: 'satellite' | 'dark';
  onToggleMapStyle: (style: 'satellite' | 'dark') => void;
  onOpenCreateProjectModal?: () => void;
}

export const MapToolbar: React.FC<MapToolbarProps> = ({
  projects,
  selectedProjectId,
  onSelectProject,
  isDrawing,
  onStartDrawing,
  onCancelDrawing,
  mapStyle,
  onToggleMapStyle,
  onOpenCreateProjectModal
}) => {
  return (
    <div className="bg-[#0B1410]/95 backdrop-blur-md border border-[#1A2E24] rounded-xl p-2.5 shadow-2xl flex flex-wrap items-center justify-between gap-3">
      {/* Left Group: Project Selector & Add Site Trigger */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-emerald-400" />
          <select
            value={selectedProjectId}
            onChange={(e) => onSelectProject(e.target.value)}
            className="bg-[#070C0A] border border-[#1A2E24] rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 max-w-xs"
          >
            <option value="">All Projects ({projects.length})</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.region})
              </option>
            ))}
          </select>
        </div>

        {isDrawing ? (
          <Button
            size="sm"
            variant="danger"
            onClick={onCancelDrawing}
            icon={<X className="w-4 h-4" />}
            className="text-xs"
          >
            Cancel Drawing
          </Button>
        ) : (
          <Button
            size="sm"
            variant="primary"
            onClick={onStartDrawing}
            icon={<PenTool className="w-4 h-4" />}
            className="text-xs animate-pulse"
          >
            Add Site (Draw Polygon)
          </Button>
        )}
      </div>

      {/* Right Group: Create Project & Map Style Toggle */}
      <div className="flex items-center space-x-2">
        {onOpenCreateProjectModal && (
          <Button
            size="sm"
            variant="secondary"
            onClick={onOpenCreateProjectModal}
            icon={<Plus className="w-3.5 h-3.5" />}
            className="text-xs"
          >
            New Project
          </Button>
        )}

        <div className="flex items-center bg-[#070C0A] border border-[#1A2E24] rounded-lg p-0.5">
          <button
            onClick={() => onToggleMapStyle('dark')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
              mapStyle === 'dark'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Dark Vector
          </button>
          <button
            onClick={() => onToggleMapStyle('satellite')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
              mapStyle === 'satellite'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Satellite
          </button>
        </div>
      </div>
    </div>
  );
};
