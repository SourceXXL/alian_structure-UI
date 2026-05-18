/* Reusable Button Component */

import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}) => {
  const baseClasses =
    'font-semibold rounded-lg transition-smooth focus:outline-none';

  const variantClasses = {
    primary: 'bg-gradient-to-r from-cosmic-purple to-cosmic-blue hover:shadow-lg hover:shadow-cosmic-purple/50',
    secondary: 'bg-cosmic-purple/30 hover:bg-cosmic-purple/60',
    outline: 'border-2 border-cosmic-purple hover:bg-cosmic-purple/10',
  };

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
