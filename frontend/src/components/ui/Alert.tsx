import React from 'react';
import clsx from 'clsx';

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'success' | 'warning' | 'danger' | 'info';
  title?: string;
}

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ variant = 'info', title, className, children, ...props }, ref) => {
    const variantStyles = {
      success: 'bg-green-50 border-green-200 text-green-800',
      warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      danger: 'bg-red-50 border-red-200 text-red-800',
      info: 'bg-blue-50 border-blue-200 text-blue-800',
    };

    return (
      <div ref={ref} className={clsx('border rounded-lg p-4', variantStyles[variant], className)} {...props}>
        {title && <h4 className="font-bold mb-2">{title}</h4>}
        {children}
      </div>
    );
  }
);

Alert.displayName = 'Alert';
