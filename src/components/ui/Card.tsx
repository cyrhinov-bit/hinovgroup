import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
  accentBorder?: 'none' | 'blue' | 'green' | 'orange' | 'magenta';
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hoverEffect = false,
  accentBorder = 'none',
  ...props
}) => {
  const accentStyles = {
    none: 'border-black/[0.06]',
    blue: 'border-t-4 border-t-[#4A94D1] border-x-black/[0.06] border-b-black/[0.06]',
    green: 'border-t-4 border-t-[#4AD07B] border-x-black/[0.06] border-b-black/[0.06]',
    orange: 'border-t-4 border-t-[#D38323] border-x-black/[0.06] border-b-black/[0.06]',
    magenta: 'border-t-4 border-t-[#A6378D] border-x-black/[0.06] border-b-black/[0.06]',
  };

  return (
    <div
      className={`bg-white rounded-2xl border shadow-xs transition-all duration-300 ${
        accentStyles[accentBorder]
      } ${
        hoverEffect
          ? 'hover:shadow-lg hover:-translate-y-0.5 hover:border-black/10'
          : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
