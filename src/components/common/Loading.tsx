import React from 'react';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

const Loading: React.FC<LoadingProps> = ({ size = 'md', text = 'Loading...' }) => {
  const sizeStyles = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[200px]">
      <div
        className={`${sizeStyles[size]} border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin`}
      />
      {text && <p className="mt-4 text-secondary-600 font-medium">{text}</p>}
    </div>
  );
};

export default Loading;
