import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive';
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({ children, variant = 'default', className, ...props }) => {
  const base = 'py-2 px-4 rounded font-semibold';
  const styles = variant === 'destructive' ? 'bg-red-600 text-white' : 'bg-blue-600 text-white';
  return (
    <button className={`${base} ${styles} ${className}`} {...props}>
      {children}
    </button>
  );
};
