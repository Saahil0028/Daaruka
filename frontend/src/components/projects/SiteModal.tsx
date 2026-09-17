import React, { useState } from 'react';
import { Project } from '../../types/project';
import { GeoJSONGeometry } from '../../types/geo';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { MapPin, ShieldCheck } from 'lucide-react';

interface SiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (projectId: string, name: string, description: string, geometry: GeoJSONGeometry) => Promise<void>;
  drawnGeometry: GeoJSONGeometry | null;
  calculatedAreaSqKm: number;
  projects: Project[];
  defaultProjectId?: string;
}

export const SiteModal: React.FC<SiteModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  drawnGeometry,
  calculatedAreaSqKm,
  projects,
  defaultProjectId = ''
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState(defaultProjectId || projects[0]?.id || '');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Site name is required.');
      return;
    }
    if (!selectedProjectId) {
      setError('Please select a target project for this site.');
      return;
    }
    if (!drawnGeometry) {
      setError('No valid polygon geometry found.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    try {
      await onSubmit(selectedProjectId, name.trim(), description.trim(), drawnGeometry);
      setName('');
      setDescription('');
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save site polygon');
    } finally {
      setIsSubmitting(false);
    }
  };

  const vertexCount = drawnGeometry?.coordinates?.[0]?.length || 0;
  const areaHa = Math.round(calculatedAreaSqKm * 100.0 * 100) / 100;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Save Drawn Site Boundary"
      subtitle="Verify calculated geodesic area and associate with a project."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-950/80 border border-red-500/50 rounded-lg p-3 text-xs text-red-300">
            {error}
          </div>
        )}

        {/* Calculated Area Highlight Card */}
        <div className="bg-[#070C0A] border border-emerald-500/40 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block uppercase font-medium">Validated Geodesic Area</span>
            <div className="mt-1 flex items-baseline space-x-1">
              <span className="text-2xl font-extrabold text-white">{calculatedAreaSqKm}</span>
              <span className="text-xs text-emerald-400 font-bold">sq km</span>
            </div>
            <span className="text-[11px] text-slate-500 block">({areaHa} hectares)</span>
          </div>

          <div className="text-right space-y-1">
            <Badge variant="lime">{vertexCount} Vertices</Badge>
            <span className="text-[10px] text-slate-400 block flex items-center justify-end space-x-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>PostGIS Validated</span>
            </span>
          </div>
        </div>

        {/* Target Project Selection */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Target Project *</label>
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="w-full bg-[#070C0A] border border-[#1A2E24] rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            required
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.region})
              </option>
            ))}
          </select>
        </div>

        <Input
          label="Site Name *"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Nilgiri Foothills Canopy Plot 1"
          required
        />

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Description (Optional)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Specific site notes, vegetation types, or soil sample references..."
            className="w-full bg-[#070C0A] border border-[#1A2E24] rounded-lg p-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="pt-4 border-t border-[#1A2E24] flex items-center justify-end space-x-3">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            Save to PostGIS
          </Button>
        </div>
      </form>
    </Modal>
  );
};
