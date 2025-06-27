import React from 'react';
import clsx from 'clsx';

export type AlertVariant = 'info' | 'success' | 'error' | 'warning';
export type AlertOpacity = '50' | '0' | '100';

const styleMap: Record<AlertVariant, Record<AlertOpacity, string>> = {
  info: {
    '100':
      'dark:bg-blue-800 bg-blue-50 dark:text-blue-200 text-blue-900 dark:border-blue-600 border-blue-200',
    '50': 'dark:bg-blue-800/50 bg-blue-50/50 dark:text-blue-200 text-blue-900 dark:border-blue-600/50 border-blue-200/50',
    '0': 'bg-transparent border-transparent dark:text-blue-200 text-blue-900',
  },
  success: {
    '100':
      'dark:bg-emerald-800 bg-green-50 dark:text-emerald-200 text-green-900 dark:border-emerald-600 border-green-200',
    '50': 'dark:bg-emerald-800/50 bg-green-50/50 dark:text-emerald-200 text-green-900 dark:border-emerald-600/50 border-green-200/50',
    '0': 'bg-transparent border-transparent dark:text-emerald-200 text-green-900',
  },
  error: {
    '100':
      'dark:bg-rose-800 bg-red-50 dark:text-rose-200 text-red-900 dark:border-rose-600 border-red-200',
    '50': 'dark:bg-rose-800/50 bg-red-50/50 dark:text-rose-200 text-red-900 dark:border-rose-600/50 border-red-200/50',
    '0': 'bg-transparent border-transparent dark:text-rose-200 text-red-900',
  },
  warning: {
    '100':
      'dark:bg-yellow-700 bg-yellow-50 dark:text-yellow-100 text-yellow-900 dark:border-yellow-600 border-yellow-200',
    '50': 'dark:bg-yellow-700/50 bg-yellow-50/50 dark:text-yellow-100 text-yellow-900 dark:border-yellow-600/50 border-yellow-200/50',
    '0': 'bg-transparent border-transparent dark:text-yellow-100 text-yellow-900',
  },
};

export const variantIcons: Record<AlertVariant, React.ReactNode> = {
  info: (
    <svg width='22' height='22' fill='none' viewBox='0 0 24 24'>
      <circle cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='2' />
      <path
        d='M12 8h.01M12 12v4'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
      />
    </svg>
  ),
  success: (
    <svg width='22' height='22' fill='none' viewBox='0 0 24 24'>
      <circle cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='2' />
      <path
        d='M8 12l2.5 2.5L16 9'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  ),
  error: (
    <svg width='22' height='22' fill='none' viewBox='0 0 24 24'>
      <circle cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='2' />
      <path
        d='M15 9l-6 6M9 9l6 6'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
      />
    </svg>
  ),
  warning: (
    <svg width='22' height='22' fill='none' viewBox='0 0 24 24'>
      <circle cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='2' />
      <path
        d='M12 8v4m0 4h.01'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
      />
    </svg>
  ),
};

export interface AlertProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  variant?: AlertVariant;
  heading?: React.ReactNode;
  children: React.ReactNode;
  opacity?: AlertOpacity;
  className?: string;
}

export function Alert({
  variant = 'info',
  heading,
  children,
  opacity = '100',
  className,
  ...props
}: AlertProps) {
  return (
    <div
      className={clsx(
        'flex gap-3 rounded-xl border px-4 py-3 text-sm',
        styleMap[variant][opacity],
        heading ? 'items-start' : 'items-center',
        className
      )}
      role='alert'
      {...props}
    >
      <span className='flex-shrink-0 mt-0.5 text-inherit'>
        {variantIcons[variant]}
      </span>
      <div className='flex flex-col'>
        {heading && <div className='font-semibold mb-0.5'>{heading}</div>}
        <div>{children}</div>
      </div>
    </div>
  );
}
