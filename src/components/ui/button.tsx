import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'default' | 'outline' | 'destructive';
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'default',
  className = '',
  ...props
}) => {
  const baseClasses = 'px-4 py-2 rounded-xl font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  const variantClasses = {
    default: 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:from-cyan-500 hover:to-blue-500 focus:ring-cyan-500 shadow-lg shadow-cyan-500/20',
    outline: 'border border-slate-700/60 bg-gradient-to-r from-slate-800/60 to-slate-900/50 text-slate-200 hover:bg-slate-800/80 hover:border-slate-600/80 focus:ring-cyan-500 shadow-md shadow-slate-950/30',
    destructive: 'bg-gradient-to-r from-red-600 to-pink-600 text-white hover:from-red-500 hover:to-pink-500 focus:ring-red-500 shadow-lg shadow-red-500/20',
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};