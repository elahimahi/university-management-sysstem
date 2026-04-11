import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  className = ''
}) => {
  const variantClasses = {
    default: 'bg-gradient-to-r from-cyan-600/40 to-blue-600/40 text-cyan-200 border border-cyan-500/40',
    secondary: 'bg-gradient-to-r from-slate-700/40 to-slate-600/40 text-slate-200 border border-slate-500/40',
    destructive: 'bg-gradient-to-r from-red-600/40 to-pink-600/40 text-red-200 border border-red-500/40',
    outline: 'border border-slate-700/60 text-slate-200 bg-gradient-to-r from-slate-800/30 to-slate-900/20',
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
};