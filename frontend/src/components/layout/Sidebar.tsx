import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FolderKanban, 
  MapPin, 
  BarChart3, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  ShieldAlert,
  TreeDeciduous
} from 'lucide-react';
import { Logo } from '../ui/Logo';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle }) => {
  const navItems = [
    { label: 'Overview', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Projects', path: '/projects', icon: FolderKanban },
    { label: 'Explore Map', path: '/map', icon: MapPin },
    { label: 'Analytics', path: '/sites', icon: BarChart3 },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside
      className={`fixed left-0 top-0 bottom-0 z-40 bg-[#0B1410] border-r border-[#1A2E24] transition-all duration-300 flex flex-col ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Header Logo */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-[#1A2E24]">
        {!isCollapsed ? (
          <Logo size="sm" showTagline />
        ) : (
          <div className="w-full flex justify-center">
            <Logo size="sm" />
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group ${
                  isActive
                    ? 'bg-emerald-950/70 text-emerald-400 border border-emerald-500/30 shadow-md shadow-emerald-950/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#122019]'
                }`
              }
              title={isCollapsed ? item.label : undefined}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 transition-colors ${isCollapsed ? 'mx-auto' : 'mr-3'}`} />
              {!isCollapsed && <span>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Simulated Data Badge */}
      {!isCollapsed && (
        <div className="px-4 py-3 mx-3 mb-4 bg-[#070C0A] border border-emerald-900/40 rounded-xl">
          <div className="flex items-center space-x-2 text-xs font-medium text-emerald-400 mb-1">
            <TreeDeciduous className="w-4 h-4 text-emerald-500" />
            <span>PostGIS Engine Active</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-tight">
            Geodesic area calculations & time-series analytics persisted in PostgreSQL.
          </p>
        </div>
      )}

      {/* Collapse Toggle */}
      <div className="p-3 border-t border-[#1A2E24] flex justify-end">
        <button
          onClick={onToggle}
          className="w-full py-2 flex items-center justify-center text-slate-400 hover:text-white bg-[#122019] hover:bg-[#1A2E24] border border-[#1A2E24] rounded-lg transition-colors"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
};
