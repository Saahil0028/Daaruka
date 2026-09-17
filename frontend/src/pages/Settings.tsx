import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import { AppShell } from '../components/layout/AppShell';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Settings as SettingsIcon, User, Key, Database, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';

export const Settings: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [mapboxToken, setMapboxToken] = useState(
    localStorage.getItem('darukaa_mapbox_token') || import.meta.env.VITE_MAPBOX_TOKEN || ''
  );
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);

  const checkHealth = async () => {
    setIsCheckingHealth(true);
    try {
      const res = await api.get('/health');
      setHealthStatus(res.data);
    } catch (err) {
      setHealthStatus({ status: 'unhealthy', error: 'Failed to reach API server' });
    } finally {
      setIsCheckingHealth(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  const handleSaveToken = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('darukaa_mapbox_token', mapboxToken.trim());
    showToast('Mapbox token updated successfully!', 'success');
  };

  return (
    <AppShell>
      <div className="space-y-6 max-w-4xl">
        <div className="border-b border-[#1A2E24] pb-4">
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center space-x-2">
            <SettingsIcon className="w-6 h-6 text-emerald-400" />
            <span>Platform Settings & Health</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure system parameters, Mapbox GL credentials, and verify PostGIS database status.
          </p>
        </div>

        {/* User Profile Card */}
        <div className="bg-[#0B1410] border border-[#1A2E24] rounded-2xl p-6 shadow-xl space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center space-x-2">
            <User className="w-4 h-4 text-emerald-400" />
            <span>Administrator Profile</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="bg-[#070C0A] border border-[#1A2E24] rounded-xl p-3">
              <span className="text-[11px] text-slate-400 block uppercase font-medium">Name</span>
              <span className="text-sm font-semibold text-white mt-1 block">{user?.name}</span>
            </div>
            <div className="bg-[#070C0A] border border-[#1A2E24] rounded-xl p-3">
              <span className="text-[11px] text-slate-400 block uppercase font-medium">Email</span>
              <span className="text-sm font-semibold text-white mt-1 block truncate">{user?.email}</span>
            </div>
            <div className="bg-[#070C0A] border border-[#1A2E24] rounded-xl p-3">
              <span className="text-[11px] text-slate-400 block uppercase font-medium">Role</span>
              <span className="text-sm font-semibold text-emerald-400 mt-1 block flex items-center space-x-1">
                <ShieldCheck className="w-4 h-4" />
                <span className="capitalize">{user?.role}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Mapbox Token Configuration */}
        <div className="bg-[#0B1410] border border-[#1A2E24] rounded-2xl p-6 shadow-xl space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center space-x-2">
            <Key className="w-4 h-4 text-emerald-400" />
            <span>Mapbox Access Token</span>
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Specify your Mapbox public access token (`VITE_MAPBOX_TOKEN`) to enable satellite vector tiles and interactive polygon drawing tools.
          </p>

          <form onSubmit={handleSaveToken} className="space-y-3 pt-2">
            <Input
              type="text"
              label="Mapbox Public Access Token"
              value={mapboxToken}
              onChange={(e) => setMapboxToken(e.target.value)}
              placeholder="pk.eyJ1Ijo..."
            />

            <div className="flex justify-end">
              <Button type="submit" variant="primary" size="sm">
                Save Mapbox Token
              </Button>
            </div>
          </form>
        </div>

        {/* PostGIS System Health Check */}
        <div className="bg-[#0B1410] border border-[#1A2E24] rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center space-x-2">
              <Database className="w-4 h-4 text-emerald-400" />
              <span>Backend & PostGIS System Health</span>
            </h2>
            <Button
              variant="secondary"
              size="sm"
              onClick={checkHealth}
              isLoading={isCheckingHealth}
              className="text-xs"
            >
              Re-check Health
            </Button>
          </div>

          {healthStatus ? (
            <div className="bg-[#070C0A] border border-[#1A2E24] rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">API Status:</span>
                <span className={`font-bold uppercase ${healthStatus.status === 'healthy' ? 'text-emerald-400' : 'text-red-400'}`}>
                  {healthStatus.status}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs border-t border-[#1A2E24] pt-2">
                <span className="text-slate-400">Database Connection:</span>
                <span className="text-slate-200 font-medium">{healthStatus.database}</span>
              </div>
              <div className="flex items-center justify-between text-xs border-t border-[#1A2E24] pt-2">
                <span className="text-slate-400">PostGIS Info:</span>
                <span className="text-emerald-300 font-mono text-[11px] truncate max-w-sm">
                  {healthStatus.postgis_info}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-500">Checking API health...</div>
          )}
        </div>
      </div>
    </AppShell>
  );
};
