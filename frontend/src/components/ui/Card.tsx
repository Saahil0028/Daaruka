import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: React.ReactNode;
  action?: React.ReactNode;
  subtitle?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  title,
  action,
  subtitle
}) => {
  return (
    <div className={`bg-[#0B1410] border border-[#1A2E24] rounded-xl shadow-xl overflow-hidden transition-all duration-200 hover:border-emerald-900/60 ${className}`}>
      {(title || action) && (
        <div className="px-5 py-4 border-b border-[#1A2E24]/80 flex items-center justify-between">
          <div>
            {title && <h3 className="text-base font-semibold text-white tracking-tight">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
};
