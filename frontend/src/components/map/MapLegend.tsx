import React from 'react';

export const MapLegend: React.FC = () => {
  const categories = [
    { label: 'Biodiversity Conservation', color: '#10B981' }, // Emerald
    { label: 'Forest Restoration', color: '#A3E635' }, // Lime
    { label: 'Reforestation', color: '#38BDF8' }, // Sky
    { label: 'Ecosystem Monitoring', color: '#F59E0B' }, // Amber
    { label: 'Other', color: '#A855F7' }, // Purple
  ];

  return (
    <div className="bg-[#0B1410]/90 backdrop-blur-md border border-[#1A2E24] rounded-xl p-3 shadow-2xl text-xs space-y-2 max-w-xs">
      <div className="font-semibold text-slate-300 text-[11px] uppercase tracking-wider border-b border-[#1A2E24] pb-1">
        Project Site Categories
      </div>
      <div className="space-y-1.5">
        {categories.map((cat) => (
          <div key={cat.label} className="flex items-center space-x-2">
            <span
              className="w-3 h-3 rounded-sm flex-shrink-0 border border-white/20"
              style={{ backgroundColor: cat.color }}
            />
            <span className="text-slate-300 text-[11px] truncate">{cat.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
