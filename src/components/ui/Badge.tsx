import React from 'react';
import { PublicationStatus, QuoteStatus, PriceDisplayMode } from '../../types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'blue' | 'green' | 'orange' | 'magenta' | 'gray' | 'red';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'gray',
  size = 'sm',
  className = '',
}) => {
  const variantStyles = {
    blue: 'bg-[#EBF4FC] text-[#3573A8] border-[#4A94D1]/20',
    green: 'bg-[#E9FAF0] text-[#32A85F] border-[#4AD07B]/20',
    orange: 'bg-[#FDF5EB] text-[#B26A15] border-[#D38323]/20',
    magenta: 'bg-[#F9ECF6] text-[#872870] border-[#A6378D]/20',
    gray: 'bg-[#F1F4F8] text-[#5F6673] border-gray-200',
    red: 'bg-red-50 text-red-700 border-red-200',
  };

  const sizeStyles = {
    sm: 'px-2.5 py-0.5 text-xs font-semibold',
    md: 'px-3 py-1 text-sm font-semibold',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border whitespace-nowrap select-none ${
        sizeStyles[size]
      } ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};

export const StatusBadge: React.FC<{
  status: PublicationStatus | QuoteStatus | PriceDisplayMode | 'in_stock' | 'out_of_stock';
  className?: string;
}> = ({ status, className = '' }) => {
  switch (status) {
    case 'published':
      return <Badge variant="green" className={className}>Publié</Badge>;
    case 'draft':
      return <Badge variant="orange" className={className}>Brouillon</Badge>;
    case 'archived':
    case 'archive':
      return <Badge variant="gray" className={className}>Archivé</Badge>;
    case 'nouveau':
      return <Badge variant="blue" className={className}>Nouveau</Badge>;
    case 'en_traitement':
      return <Badge variant="orange" className={className}>En traitement</Badge>;
    case 'repondu':
      return <Badge variant="green" className={className}>Répondu</Badge>;
    case 'cloture':
      return <Badge variant="gray" className={className}>Clôturé</Badge>;
    case 'show':
      return <Badge variant="green" className={className}>Prix visible</Badge>;
    case 'hide':
      return <Badge variant="gray" className={className}>Prix masqué</Badge>;
    case 'on_demand':
      return <Badge variant="magenta" className={className}>Sur demande</Badge>;
    case 'in_stock':
      return <Badge variant="green" className={className}>En stock</Badge>;
    case 'out_of_stock':
      return <Badge variant="red" className={className}>Rupture</Badge>;
    default:
      return <Badge variant="gray" className={className}>{status}</Badge>;
  }
};
