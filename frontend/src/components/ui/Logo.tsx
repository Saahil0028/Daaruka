import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 'md', showTagline = false }) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* Custom Vector Mark: Tree Canopy + Contour Pin */}
      <div className={`relative ${iconSizes[size]} flex items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 via-forest-700 to-dark-800 p-0.5 shadow-lg shadow-emerald-950/40 border border-emerald-500/30 group`}>
        <div className="w-full h-full bg-[#0B1410] rounded-[10px] flex items-center justify-center overflow-hidden relative">
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4/5 h-4/5 text-emerald-400">
            {/* Topographic Contour Lines Background */}
            <path d="M10 80 C 30 70, 70 90, 90 80" stroke="#1F3D2C" strokeWidth="3" strokeDasharray="2 2" />
            <path d="M15 65 C 40 55, 60 75, 85 60" stroke="#2D5A41" strokeWidth="3" strokeDasharray="3 3" />
            
            {/* Stylized Tree Canopy Canopy Pin */}
            <path d="M50 12 C 30 12, 20 32, 25 50 C 30 65, 50 88, 50 88 C 50 88, 70 65, 75 50 C 80 32, 70 12, 50 12 Z" 
                  fill="url(#canopyGradient)" 
                  stroke="#34D399" 
                  strokeWidth="4" />
            
            {/* Inner Ring Canopy Contour */}
            <circle cx="50" cy="38" r="14" fill="#0B1410" stroke="#10B981" strokeWidth="3" />
            <circle cx="50" cy="38" r="6" fill="#A3E635" />

            <defs>
              <linearGradient id="canopyGradient" x1="20" y1="12" x2="80" y2="88" gradientUnits="userSpaceOnUse">
                <stop stopColor="#10B981" />
                <stop offset="1" stopColor="#064E3B" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      <div className="flex flex-col">
        <span className={`font-bold tracking-tight text-white ${textSizes[size]}`}>
          Darukaa<span className="text-emerald-400 font-extrabold">.Earth</span>
        </span>
        {showTagline && (
          <span className="text-[10px] uppercase tracking-widest text-emerald-400/80 font-medium">
            Environmental Intelligence
          </span>
        )}
      </div>
    </div>
  );
};
