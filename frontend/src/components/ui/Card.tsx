import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Card = ({ children, className = '', ...props }: CardProps) => {
  return (
    <div
      className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-4 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '' }: CardProps) => (
  <div className={`mb-2 ${className}`}>{children}</div>
);

export const CardTitle = ({ children, className = '' }: CardProps) => (
  <h3 className={`text-lg font-semibold ${className}`}>{children}</h3>
);

export const CardDescription = ({ children, className = '' }: CardProps) => (
  <p className={`text-sm text-gray-500 dark:text-gray-400 ${className}`}>{children}</p>
);

export const CardContent = ({ children, className = '' }: CardProps) => (
  <div className={className}>{children}</div>
);
