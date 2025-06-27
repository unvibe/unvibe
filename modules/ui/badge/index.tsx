// Badge component with light & dark theme support via tailwind classes
import React from 'react';
import clsx from 'clsx';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  color?:
    | 'default'
    | 'primary'
    | 'success'
    | 'danger'
    | 'warning';
  size?: 'sm' | 'md' | 'lg';
}

const colorClasses: Record<string, string> = {
  default: 'bg-background-1 text-foreground border border-border dark:bg-background-2 dark:text-foreground dark:border-border-1',
  primary:
    'bg-blue-600 text-white border-blue-500 dark:bg-blue-800 dark:text-blue-200 dark:border-blue-600',
  success:
    'bg-emerald-500 text-white border-emerald-500 dark:bg-emerald-800 dark:text-emerald-200 dark:border-emerald-600',
  danger:
    'bg-rose-500 text-white border-rose-500 dark:bg-rose-800 dark:text-rose-200 dark:border-rose-600',
  warning:
    'bg-yellow-300 text-gray-900 border-yellow-400 dark:bg-yellow-700 dark:text-yellow-100 dark:border-yellow-600',
};

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
  lg: 'px-4 py-1.5 text-base',
};

export const Badge: React.FC<BadgeProps> = ({
  color = 'default',
  size = 'md',
  className,
  ...props
}) => (
  <span
    className={clsx(
      'inline-block rounded-full font-semibold',
      colorClasses[color],
      sizeClasses[size],
      className
    )}
    {...props}
  />
);
