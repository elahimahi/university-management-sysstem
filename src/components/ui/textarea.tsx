import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  className?: string;
}

export const Textarea: React.FC<TextareaProps> = ({ className = '', ...props }) => (
  <textarea
    className={`w-full px-4 py-3 bg-gradient-to-br from-slate-900/90 to-slate-950/80 text-slate-100 border border-slate-700/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-500/30 resize-vertical placeholder:text-slate-500 ${className}`}
    {...props}
  />
);