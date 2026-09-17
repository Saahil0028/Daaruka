import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  const routeNameMap: Record<string, string> = {
    dashboard: 'Dashboard',
    projects: 'Projects',
    map: 'Explore Map',
    sites: 'Sites & Analytics',
    settings: 'Settings',
  };

  return (
    <nav className="flex items-center space-x-2 text-xs text-slate-400">
      <Link to="/dashboard" className="hover:text-emerald-400 transition-colors flex items-center">
        <Home className="w-3.5 h-3.5" />
      </Link>
      {pathnames.map((value, index) => {
        const to = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        const displayName = routeNameMap[value] || (value.length > 12 ? `${value.substring(0, 8)}...` : value);

        return (
          <React.Fragment key={to}>
            <ChevronRight className="w-3 h-3 text-slate-600" />
            {isLast ? (
              <span className="font-semibold text-emerald-400 capitalize">{displayName}</span>
            ) : (
              <Link to={to} className="hover:text-emerald-400 transition-colors capitalize">
                {displayName}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
