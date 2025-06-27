// Pagination component (compact, accessible, with ellipsis) with light/dark theme support
import React from 'react';
import clsx from 'clsx';

export interface PaginationProps {
  page: number;
  pageCount: number;
  onPageChange: (newPage: number) => void;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({ page, pageCount, onPageChange, className }) => {
  if (pageCount <= 1) return null;
  const getPages = () => {
    const pages = [];
    let start = Math.max(1, page - 2);
    let end = Math.min(pageCount, page + 2);
    if (page <= 3) end = Math.min(5, pageCount);
    if (page >= pageCount - 2) start = Math.max(1, pageCount - 4);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  const pages = getPages();

  return (
    <nav className={clsx('flex items-center gap-1 select-none', className)} aria-label="Pagination">
      <button
        className="px-2 py-1 rounded hover:bg-background-1 dark:hover:bg-background-2 disabled:opacity-50"
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page === 1}
        aria-label="Previous page"
      >
        &larr;
      </button>
      {pages[0] > 1 && (
        <>
          <button className="px-2 py-1 rounded hover:bg-background-1 dark:hover:bg-background-2" onClick={() => onPageChange(1)}>
            1
          </button>
          {pages[0] > 2 && <span className="px-2">…</span>}
        </>
      )}
      {pages.map((p) => (
        <button
          key={p}
          className={clsx(
            'px-2 py-1 rounded',
            p === page
              ? 'bg-blue-500 text-white font-bold dark:bg-blue-800 dark:text-blue-200'
              : 'hover:bg-background-1 dark:hover:bg-background-2'
          )}
          disabled={p === page}
          aria-current={p === page ? 'page' : undefined}
          onClick={() => onPageChange(p)}
        >
          {p}
        </button>
      ))}
      {pages[pages.length - 1] < pageCount && (
        <>
          {pages[pages.length - 1] < pageCount - 1 && <span className="px-2">…</span>}
          <button className="px-2 py-1 rounded hover:bg-background-1 dark:hover:bg-background-2" onClick={() => onPageChange(pageCount)}>
            {pageCount}
          </button>
        </>
      )}
      <button
        className="px-2 py-1 rounded hover:bg-background-1 dark:hover:bg-background-2 disabled:opacity-50"
        onClick={() => onPageChange(Math.min(pageCount, page + 1))}
        disabled={page === pageCount}
        aria-label="Next page"
      >
        &rarr;
      </button>
    </nav>
  );
};
