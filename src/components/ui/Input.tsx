import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, helperText, error, leftIcon, rightIcon, className = '', id, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 6)}`;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-bold text-[#111111] uppercase tracking-wider mb-1.5">
            {label}
            {props.required && <span className="text-[#D38323] ml-1">*</span>}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3.5 pointer-events-none text-[#5F6673]">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={`w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-[#111111] placeholder:text-[#5F6673]/60 transition-all duration-200 outline-none
              ${leftIcon ? 'pl-10' : ''}
              ${rightIcon ? 'pr-10' : ''}
              ${
                error
                  ? 'border-red-500 focus:ring-2 focus:ring-red-500/20'
                  : 'border-black/15 focus:border-[#4A94D1] focus:ring-2 focus:ring-[#4A94D1]/20'
              }
              disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed
              ${className}`}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3.5 pointer-events-none text-[#5F6673]">
              {rightIcon}
            </div>
          )}
        </div>
        {error ? (
          <p className="mt-1 text-xs text-red-600 font-medium">{error}</p>
        ) : helperText ? (
          <p className="mt-1 text-xs text-[#5F6673]">{helperText}</p>
        ) : null}
      </div>
    );
  }
);
Input.displayName = 'Input';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, helperText, error, className = '', id, rows = 4, ...props }, ref) => {
    const areaId = id || `area-${Math.random().toString(36).substr(2, 6)}`;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={areaId} className="block text-xs font-bold text-[#111111] uppercase tracking-wider mb-1.5">
            {label}
            {props.required && <span className="text-[#D38323] ml-1">*</span>}
          </label>
        )}
        <textarea
          id={areaId}
          ref={ref}
          rows={rows}
          className={`w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-[#111111] placeholder:text-[#5F6673]/60 transition-all duration-200 outline-none
            ${
              error
                ? 'border-red-500 focus:ring-2 focus:ring-red-500/20'
                : 'border-black/15 focus:border-[#4A94D1] focus:ring-2 focus:ring-[#4A94D1]/20'
            }
            disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed
            ${className}`}
          {...props}
        />
        {error ? (
          <p className="mt-1 text-xs text-red-600 font-medium">{error}</p>
        ) : helperText ? (
          <p className="mt-1 text-xs text-[#5F6673]">{helperText}</p>
        ) : null}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helperText?: string;
  error?: string;
  options?: Array<{ value: string; label: string }>;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, helperText, error, options, children, className = '', id, ...props }, ref) => {
    const selectId = id || `select-${Math.random().toString(36).substr(2, 6)}`;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={selectId} className="block text-xs font-bold text-[#111111] uppercase tracking-wider mb-1.5">
            {label}
            {props.required && <span className="text-[#D38323] ml-1">*</span>}
          </label>
        )}
        <select
          id={selectId}
          ref={ref}
          className={`w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-[#111111] transition-all duration-200 outline-none appearance-none cursor-pointer
            ${
              error
                ? 'border-red-500 focus:ring-2 focus:ring-red-500/20'
                : 'border-black/15 focus:border-[#4A94D1] focus:ring-2 focus:ring-[#4A94D1]/20'
            }
            disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed
            ${className}`}
          {...props}
        >
          {options
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))
            : children}
        </select>
        {error ? (
          <p className="mt-1 text-xs text-red-600 font-medium">{error}</p>
        ) : helperText ? (
          <p className="mt-1 text-xs text-[#5F6673]">{helperText}</p>
        ) : null}
      </div>
    );
  }
);
Select.displayName = 'Select';
