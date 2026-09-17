import React, { useState, useEffect } from 'react';
import { projectService } from '../services/projectService';
import { Project, ProjectCreateInput } from '../types/project';
import { AppShell } from '../components/layout/AppShell';
import { ProjectCard } from '../components/projects/ProjectCard';
import { ProjectModal } from '../components/projects/ProjectModal';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Skeleton } from '../components/ui/Skeleton';
import { useToast } from '../context/ToastContext';
import { FolderKanban, Plus, Search, Filter, RefreshCw } from 'lucide-react';

export const Projects: React.FC = () => {
  const { showToast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const data = await projectService.getProjects(search, categoryFilter, statusFilter);
      setProjects(data);
    } catch (err) {
      console.error('Failed to fetch projects:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [search, categoryFilter, statusFilter]);

  const handleCreateOrUpdateProject = async (input: ProjectCreateInput) => {
    if (projectToEdit) {
      await projectService.updateProject(projectToEdit.id, input);
      showToast('Project updated successfully', 'success');
    } else {
      await projectService.createProject(input);
      showToast('Project created successfully!', 'success');
    }
    setProjectToEdit(null);
    fetchProjects();
  };

  const handleDeleteProject = async (projectId: string) => {
    if (window.confirm('Are you sure you want to delete this project? All associated sites and analytics will be permanently removed from PostGIS.')) {
      try {
        await projectService.deleteProject(projectId);
        showToast('Project deleted successfully', 'success');
        fetchProjects();
      } catch (err: any) {
        showToast(err.response?.data?.detail || 'Failed to delete project', 'error');
      }
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header Title */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1A2E24] pb-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center space-x-2">
              <FolderKanban className="w-6 h-6 text-emerald-400" />
              <span>Environmental Projects</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Manage carbon offsets, biodiversity conservation projects, and spatial site polygons.
            </p>
          </div>

          <Button
            variant="primary"
            onClick={() => {
              setProjectToEdit(null);
              setIsModalOpen(true);
            }}
            icon={<Plus className="w-4 h-4" />}
          >
            Create New Project
          </Button>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="bg-[#0B1410] border border-[#1A2E24] rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-1 items-center space-x-3 min-w-[280px]">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search projects by name or region..."
              icon={<Search className="w-4 h-4 text-slate-400" />}
              className="bg-[#070C0A]"
            />
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1.5 text-xs text-slate-400">
              <Filter className="w-3.5 h-3.5 text-emerald-400" />
              <span>Category:</span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-[#070C0A] border border-[#1A2E24] rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">All Categories</option>
                <option value="Biodiversity Conservation">Biodiversity Conservation</option>
                <option value="Forest Restoration">Forest Restoration</option>
                <option value="Reforestation">Reforestation</option>
                <option value="Ecosystem Monitoring">Ecosystem Monitoring</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="flex items-center space-x-1.5 text-xs text-slate-400">
              <span>Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-[#070C0A] border border-[#1A2E24] rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Planning">Planning</option>
                <option value="Completed">Completed</option>
                <option value="Archived">Archived</option>
              </select>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={fetchProjects}
              icon={<RefreshCw className="w-3.5 h-3.5" />}
              className="text-xs"
            >
              Refresh
            </Button>
          </div>
        </div>

        {/* Projects Cards Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array(6)
              .fill(0)
              .map((_, i) => (
                <Skeleton key={i} className="h-64 w-full" />
              ))}
          </div>
        ) : projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onEdit={(p) => {
                  setProjectToEdit(p);
                  setIsModalOpen(true);
                }}
                onDelete={handleDeleteProject}
              />
            ))}
          </div>
        ) : (
          <div className="bg-[#0B1410] border border-[#1A2E24] rounded-2xl p-12 text-center space-y-4">
            <FolderKanban className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-white">No Projects Found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {search || categoryFilter || statusFilter
                ? 'No projects match your current search filters. Try adjusting your query.'
                : 'Create your first project to start mapping geographical site polygons and tracking carbon analytics.'}
            </p>
            <Button
              variant="primary"
              onClick={() => {
                setProjectToEdit(null);
                setIsModalOpen(true);
              }}
              icon={<Plus className="w-4 h-4" />}
            >
              Create First Project
            </Button>
          </div>
        )}
      </div>

      <ProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateOrUpdateProject}
        projectToEdit={projectToEdit}
      />
    </AppShell>
  );
};
