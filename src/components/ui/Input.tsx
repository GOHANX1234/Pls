import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, fullWidth = true, className = '', icon, ...props }, ref) => {
    const baseInputStyles = `
      block w-full px-4 py-2.5 text-sm
      bg-black/40 backdrop-blur-xl
      border border-blue-500/20
      text-white placeholder-blue-200/50
      rounded-lg
      focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/20
      disabled:opacity-50 disabled:cursor-not-allowed
      transition-all duration-200
    `;

    const containerStyles = `${fullWidth ? 'w-full' : ''} ${className}`;

    return (
      <div className={containerStyles}>
        {label && (
          <label 
            htmlFor={props.id} 
            className="block text-sm font-medium text-blue-100 mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={`
              ${baseInputStyles}
              ${icon ? 'pl-10' : ''}
            `}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1.5 text-sm text-red-400">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;