import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'magenta';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer select-none active:scale-[0.98]';

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs gap-1.5 min-h-[36px]',
    md: 'px-5 py-2.5 text-sm gap-2 min-h-[44px]',
    lg: 'px-6 py-3 text-base gap-2.5 min-h-[50px]',
  };

  // Respecting color hierarchy:
  // Orange = Primary CTA, action buttons
  // Blue = Institutional, secondary action
  // Green = Positive, validation
  // Magenta = Creative accents
  const variantStyles = {
    primary:
      'bg-[#D38323] hover:bg-[#B26A15] text-white shadow-xs hover:shadow-md focus:ring-[#D38323]',
    secondary:
      'bg-[#4A94D1] hover:bg-[#3573A8] text-white shadow-xs hover:shadow-md focus:ring-[#4A94D1]',
    outline:
      'border-2 border-[#4A94D1] text-[#4A94D1] hover:bg-[#4A94D1]/10 focus:ring-[#4A94D1]',
    ghost:
      'text-[#5F6673] hover:text-[#111111] hover:bg-black/5 focus:ring-gray-300',
    danger:
      'bg-red-600 hover:bg-red-700 text-white shadow-xs focus:ring-red-500',
    success:
      'bg-[#4AD07B] hover:bg-[#32A85F] text-white shadow-xs focus:ring-[#4AD07B]',
    magenta:
      'bg-[#A6378D] hover:bg-[#872870] text-white shadow-xs focus:ring-[#A6378D]',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          />
        </svg>
      ) : (
        leftIcon && <span className="shrink-0">{leftIcon}</span>
      )}
      <span className="whitespace-nowrap font-semibold">{children}</span>
      {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
};
