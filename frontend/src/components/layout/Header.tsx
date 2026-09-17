import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Breadcrumbs } from './Breadcrumbs';
import { Button } from '../ui/Button';
import { User, LogOut, Database, ShieldCheck, MapPin } from 'lucide-react';

interface HeaderProps {
  onOpenSeedModal?: () => void;
}

export const Header: React.FC<HeaderProps> = () => {
  const { user, logout, seedDemo } = useAuth();
  const { showToast } = useToast();
  const [isSeeding, setIsSeeding] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleSeed = async () => {
    setIsSeeding(true);
    try {
      const res = await seedDemo();
      showToast(res.message || 'Demo data successfully seeded into PostGIS!', 'success');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err: any) {
      showToast(err.response?.data?.detail || 'Failed to seed demo data', 'error');
    } finally {
      setIsSeeding(false);
    }
  };

  const hasMapboxToken = Boolean(import.meta.env.VITE_MAPBOX_TOKEN);

  return (
    <header className="h-16 bg-[#0B1410] border-b border-[#1A2E24] px-6 flex items-center justify-between sticky top-0 z-30 shadow-md">
      {/* Breadcrumbs */}
      <Breadcrumbs />

      {/* Action Toolbar */}
      <div className="flex items-center space-x-4">
        {/* Mapbox Token Status Badge */}
        <div className="hidden md:flex items-center space-x-1.5 px-3 py-1 bg-[#070C0A] border border-[#1A2E24] rounded-lg text-xs">
          <MapPin className={`w-3.5 h-3.5 ${hasMapboxToken ? 'text-emerald-400' : 'text-amber-400'}`} />
          <span className="text-slate-400">Map Engine:</span>
          <span className={hasMapboxToken ? 'text-emerald-400 font-medium' : 'text-amber-400 font-medium'}>
            {hasMapboxToken ? 'Mapbox GL JS' : 'Demo Token Mode'}
          </span>
        </div>

        {/* Quick Seed Demo Dataset Button */}
        <Button
          variant="secondary"
          size="sm"
          isLoading={isSeeding}
          onClick={handleSeed}
          icon={<Database className="w-3.5 h-3.5 text-emerald-400" />}
          className="text-xs"
        >
          Seed Demo Data
        </Button>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center space-x-2.5 p-1.5 rounded-lg bg-[#122019] border border-[#1A2E24] hover:border-emerald-800 transition-colors"
          >
            <div className="w-7 h-7 rounded-md bg-emerald-600/30 border border-emerald-500/50 flex items-center justify-center text-emerald-300 font-bold text-xs">
              {user?.name?.charAt(0).toUpperCase() || 'A'}
            </div>
            <span className="text-xs font-medium text-slate-200 hidden sm:inline">{user?.name}</span>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-[#0B1410] border border-[#1A2E24] rounded-xl shadow-2xl py-2 z-50 animate-fade-in">
              <div className="px-4 py-2 border-b border-[#1A2E24]">
                <p className="text-xs font-semibold text-white">{user?.name}</p>
                <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                <div className="mt-1 flex items-center space-x-1 text-[10px] text-emerald-400">
                  <ShieldCheck className="w-3 h-3" />
                  <span className="uppercase tracking-wider">Role: {user?.role}</span>
                </div>
              </div>

              <button
                onClick={logout}
                className="w-full text-left px-4 py-2 text-xs text-red-400 hover:bg-red-950/20 flex items-center space-x-2 transition-colors mt-1"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout Session</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
