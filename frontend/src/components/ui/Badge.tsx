import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'emerald' | 'lime' | 'amber' | 'blue' | 'gray' | 'red';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'emerald',
  size = 'sm',
  className = ''
}) => {
  const variants = {
    emerald: 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60',
    lime: 'bg-lime-950/80 text-lime-300 border-lime-800/60',
    amber: 'bg-amber-950/80 text-amber-300 border-amber-800/60',
    blue: 'bg-sky-950/80 text-sky-300 border-sky-800/60',
    gray: 'bg-slate-800/80 text-slate-300 border-slate-700/60',
    red: 'bg-red-950/80 text-red-300 border-red-800/60',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[11px]',
    md: 'px-2.5 py-1 text-xs',
  };

  return (
    <span className={`inline-flex items-center font-medium rounded-md border ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </span>
  );
};
