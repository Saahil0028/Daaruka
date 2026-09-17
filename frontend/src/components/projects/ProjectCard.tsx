import React from 'react';
import { Project } from '../../types/project';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { MapPin, Layers, Calendar, ArrowRight, Trash2, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ProjectCardProps {
  project: Project;
  onEdit?: (project: Project) => void;
  onDelete?: (projectId: string) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onEdit,
  onDelete
}) => {
  const navigate = useNavigate();

  const categoryVariants: Record<string, 'emerald' | 'lime' | 'blue' | 'amber' | 'gray'> = {
    'Biodiversity Conservation': 'emerald',
    'Forest Restoration': 'lime',
    'Reforestation': 'blue',
    'Ecosystem Monitoring': 'amber',
    'Other': 'gray',
  };

  const statusVariants: Record<string, 'emerald' | 'amber' | 'blue' | 'gray'> = {
    Active: 'emerald',
    Planning: 'amber',
    Completed: 'blue',
    Archived: 'gray',
  };

  return (
    <div className="bg-[#0B1410] border border-[#1A2E24] rounded-xl p-5 shadow-xl hover:border-emerald-700/60 transition-all duration-200 flex flex-col justify-between group">
      <div>
        {/* Header Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <Badge variant={categoryVariants[project.category] || 'gray'}>
            {project.category}
          </Badge>
          <Badge variant={statusVariants[project.status] || 'gray'}>
            {project.status}
          </Badge>
        </div>

        {/* Title & Region */}
        <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors">
          {project.name}
        </h3>
        <p className="text-xs text-slate-400 mt-1 flex items-center space-x-1">
          <MapPin className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
          <span>{project.region}</span>
        </p>

        {/* Description */}
        {project.description && (
          <p className="text-xs text-slate-300 mt-2.5 line-clamp-2 leading-relaxed">
            {project.description}
          </p>
        )}
      </div>

      {/* Metrics Footer */}
      <div className="mt-5 pt-4 border-t border-[#1A2E24] space-y-3">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-[#070C0A] border border-[#1A2E24] rounded-lg p-2">
            <span className="text-[10px] text-slate-400 uppercase font-medium">Mapped Sites</span>
            <div className="font-semibold text-slate-200 mt-0.5 flex items-center space-x-1">
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              <span>{project.sites_count} sites</span>
            </div>
          </div>

          <div className="bg-[#070C0A] border border-[#1A2E24] rounded-lg p-2">
            <span className="text-[10px] text-slate-400 uppercase font-medium">Mapped Area</span>
            <div className="font-semibold text-slate-200 mt-0.5">
              <span>{project.total_area_sq_km} sq km</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center space-x-1">
            {onEdit && (
              <button
                onClick={() => onEdit(project)}
                className="p-1.5 text-slate-400 hover:text-white rounded-md hover:bg-[#122019]"
                title="Edit Project"
              >
                <Edit className="w-3.5 h-3.5" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(project.id)}
                className="p-1.5 text-slate-400 hover:text-red-400 rounded-md hover:bg-red-950/20"
                title="Delete Project"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate(`/projects/${project.id}`)}
            icon={<ArrowRight className="w-3.5 h-3.5" />}
            className="text-xs"
          >
            Explore Project
          </Button>
        </div>
      </div>
    </div>
  );
};
