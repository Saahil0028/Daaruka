import React from 'react';
import { TrendingUp, TrendingDown, Minus, Info } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: React.ReactNode;
  subtitle?: string;
  tooltip?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit,
  change,
  changeType = 'positive',
  icon,
  subtitle,
  tooltip
}) => {
  return (
    <div className="bg-[#0B1410] border border-[#1A2E24] rounded-xl p-5 shadow-xl hover:border-emerald-800 transition-all duration-200 flex flex-col justify-between min-w-0">
      <div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider truncate" title={title}>
            {title}
          </span>
          <div className="w-8 h-8 rounded-lg bg-[#122019] border border-[#1A2E24] flex items-center justify-center text-emerald-400 shadow-inner flex-shrink-0">
            {icon}
          </div>
        </div>

        <div className="mt-3 flex items-baseline space-x-1.5 flex-wrap">
          <span className="text-2xl font-extrabold text-white tracking-tight">{value}</span>
          {unit && <span className="text-xs text-emerald-400 font-bold">{unit}</span>}
        </div>
      </div>

      {(change || subtitle) && (
        <div className="mt-4 pt-2.5 border-t border-[#1A2E24]/60 space-y-1 text-xs">
          {change && (
            <div
              className={`flex items-center space-x-1 font-medium text-xs ${
                changeType === 'positive'
                  ? 'text-emerald-400'
                  : changeType === 'negative'
                  ? 'text-red-400'
                  : 'text-slate-400'
              }`}
            >
              {changeType === 'positive' && <TrendingUp className="w-3.5 h-3.5 flex-shrink-0" />}
              {changeType === 'negative' && <TrendingDown className="w-3.5 h-3.5 flex-shrink-0" />}
              {changeType === 'neutral' && <Minus className="w-3.5 h-3.5 flex-shrink-0" />}
              <span className="truncate">{change}</span>
            </div>
          )}
          {subtitle && (
            <p className="text-[11px] text-slate-400 leading-tight" title={subtitle}>
              {subtitle}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
