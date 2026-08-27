import React from 'react';
import clsx from 'clsx';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ title, subtitle, children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={clsx('bg-white rounded-lg shadow-md border border-gray-200 p-6', className)}
        {...props}
      >
        {title && (
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
            {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
          </div>
        )}
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
