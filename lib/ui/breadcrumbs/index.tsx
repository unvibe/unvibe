// Breadcrumbs component (accessible, beautiful)
import React from 'react';
import Link from '@/lib/next/link';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  items,
  className,
}) => (
  <nav aria-label='Breadcrumb' className={className}>
    <ol className='flex items-center gap-2 text-sm'>
      {items.map((item, idx) => (
        <li key={item.label} className='flex items-center'>
          {item.href ? (
            <Link
              href={item.href}
              className={
                idx === items.length - 1
                  ? 'font-semibold text-foreground'
                  : 'text-blue-600 hover:underline'
              }
              aria-current={idx === items.length - 1 ? 'page' : undefined}
            >
              {item.label}
            </Link>
          ) : (
            <span className='font-semibold text-foreground'>{item.label}</span>
          )}
          {idx < items.length - 1 && (
            <span className='mx-2 text-foreground-2'>/</span>
          )}
        </li>
      ))}
    </ol>
  </nav>
);
