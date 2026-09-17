import React, { useState } from 'react';
import { Project, ProjectCreateInput } from '../../types/project';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProjectCreateInput) => Promise<void>;
  projectToEdit?: Project | null;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  projectToEdit
}) => {
  const [name, setName] = useState(projectToEdit?.name || '');
  const [description, setDescription] = useState(projectToEdit?.description || '');
  const [category, setCategory] = useState(projectToEdit?.category || 'Biodiversity Conservation');
  const [region, setRegion] = useState(projectToEdit?.region || '');
  const [status, setStatus] = useState(projectToEdit?.status || 'Active');
  const [startDate, setStartDate] = useState(
    projectToEdit?.start_date || new Date().toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(projectToEdit?.end_date || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !region.trim()) {
      setError('Project name and region are required.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim() || undefined,
        category,
        region: region.trim(),
        status,
        start_date: startDate,
        end_date: endDate || undefined,
      });
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save project');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={projectToEdit ? 'Edit Project Details' : 'Create Environmental Project'}
      subtitle="Define project location, conservation category, and operational timeline."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-950/80 border border-red-500/50 rounded-lg p-3 text-xs text-red-300">
            {error}
          </div>
        )}

        <Input
          label="Project Name *"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Western Ghats Rainforest Reserve"
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Category *</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="w-full bg-[#070C0A] border border-[#1A2E24] rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="Biodiversity Conservation">Biodiversity Conservation</option>
              <option value="Forest Restoration">Forest Restoration</option>
              <option value="Reforestation">Reforestation</option>
              <option value="Ecosystem Monitoring">Ecosystem Monitoring</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Status *</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full bg-[#070C0A] border border-[#1A2E24] rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="Planning">Planning</option>
              <option value="Active">Active</option>
              <option value="Completed">Completed</option>
              <option value="Archived">Archived</option>
            </select>
          </div>
        </div>

        <Input
          label="Geographic Region / Country *"
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          placeholder="e.g. Western Ghats, India"
          required
        />

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Overview of environmental goals, ecosystem type, and carbon monitoring objectives..."
            className="w-full bg-[#070C0A] border border-[#1A2E24] rounded-lg p-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            type="date"
            label="Start Date *"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
          <Input
            type="date"
            label="End Date (Optional)"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        <div className="pt-4 border-t border-[#1A2E24] flex items-center justify-end space-x-3">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            {projectToEdit ? 'Save Changes' : 'Create Project'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
