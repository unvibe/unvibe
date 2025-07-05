import { ButtonHTMLAttributes } from 'react';
import clsx from 'clsx';
import { Spinner } from '@/lib/ui/spinner';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | 'default'
    | 'primary'
    | 'secondary'
    | 'danger'
    | 'success'
    | 'error'
    | 'warning'
    | 'info';
  isLoading?: boolean;
  disabled?: boolean;
}

export function Button({
  children,
  variant = 'default',
  isLoading = false,
  disabled = false,
  className,
  ...props
}: ButtonProps) {
  const baseStyles =
    'px-4 py-2 rounded-xl font-medium border focus:outline-none transition duration-200 ease-in-out cursor-pointer';
  const variantStyles = {
    default: 'bg-background-1 text-foreground border border-border',
    primary:
      'dark:bg-blue-800 bg-blue-600 text-white dark:text-blue-200 dark:border-blue-600 border-blue-500',
    secondary: 'bg-background-2 text-foreground-2 border border-border',
    danger:
      'dark:bg-red-800 bg-red-600 text-white dark:text-red-200 dark:border-red-600 border-red-500',
    success:
      'dark:bg-emerald-800 bg-emerald-500 text-white dark:text-emerald-200 dark:border-emerald-600 border-emerald-500',
    error:
      'dark:bg-rose-800 bg-rose-500 text-white dark:text-rose-200 dark:border-rose-600 border-rose-500',
    warning:
      'dark:bg-yellow-700 bg-yellow-500 text-black dark:text-yellow-100 dark:border-yellow-600 border-yellow-500',
    info: 'dark:bg-blue-800 bg-blue-500 text-white dark:text-blue-200 dark:border-blue-600 border-blue-500',
  };

  const disabledStyles = 'opacity-50 cursor-not-allowed';

  return (
    <button
      className={clsx(
        baseStyles,
        variantStyles[variant],
        disabled && disabledStyles,
        className
      )}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? <Spinner className='w-6 h-6' /> : children}
    </button>
  );
}
