import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  text,
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <div
        className={`${sizeClasses[size]} rounded-full border-t-[#4A94D1] border-r-transparent border-b-[#4AD07B] border-l-transparent animate-spin`}
        role="status"
        aria-label="Chargement..."
      />
      {text && <p className="text-xs font-semibold text-[#5F6673] animate-pulse">{text}</p>}
    </div>
  );
};
