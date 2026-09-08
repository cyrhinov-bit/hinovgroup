import React from 'react';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-2xl border-2 border-dashed border-black/10 bg-white/60 ${className}`}
    >
      {icon && (
        <div className="w-16 h-16 rounded-2xl bg-[#EBF4FC] text-[#4A94D1] flex items-center justify-center mb-4 shadow-xs">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-bold text-[#111111] mb-2">{title}</h3>
      <p className="text-sm text-[#5F6673] max-w-md mb-6">{description}</p>
      {actionLabel && onAction && (
        <Button variant="primary" size="md" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export const LoadingSpinner: React.FC<{
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}> = ({ size = 'md', text, className = '' }) => {
  const sizeStyles = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div className={`flex flex-col items-center justify-center p-6 gap-3 ${className}`}>
      <div
        className={`${sizeStyles[size]} rounded-full border-t-[#4A94D1] border-r-[#D38323] border-b-[#4AD07B] border-l-[#A6378D] animate-spin`}
      />
      {text && <p className="text-xs font-semibold text-[#5F6673] animate-pulse">{text}</p>}
    </div>
  );
};
