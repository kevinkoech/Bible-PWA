import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive';
}

export const Button: React.FC<ButtonProps> = ({ children, variant = 'default', className = '', ...props }) => {
  const base = 'px-4 py-2 rounded font-medium transition-colors focus:outline-none focus:ring';
  const style =
    variant === 'destructive'
      ? 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
      : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500';

  return (
    <button className={`${base} ${style} ${className}`} {...props}>
      {children}
    </button>
  );
};
