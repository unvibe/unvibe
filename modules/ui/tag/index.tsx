// Tag/Chip component with light & dark theme support via tailwind classes
import React from 'react';
import clsx from 'clsx';

export interface TagProps {
  children: React.ReactNode;
  color?:
    | 'default'
    | 'primary'
    | 'success'
    | 'danger'
    | 'warning';
  onRemove?: () => void;
  className?: string;
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

export const Tag: React.FC<TagProps> = ({ children, color = 'default', onRemove, className }) => (
  <span
    className={clsx(
      'inline-flex items-center rounded-full px-3 py-0.5 font-medium text-sm gap-2',
      colorClasses[color],
      className
    )}
  >
    <span>{children}</span>
    {onRemove && (
      <button
        onClick={onRemove}
        className="ml-1 text-lg text-foreground hover:text-rose-600 dark:hover:text-rose-400 rounded-full focus:outline-none"
        aria-label="Remove tag"
        tabIndex={0}
        type="button"
      >
        &times;
      </button>
    )}
  </span>
);
