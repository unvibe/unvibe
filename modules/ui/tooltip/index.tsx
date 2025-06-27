// Tooltip component (fully interactive, accessible) with Tailwind styling and theme support
import React, { useState, useRef } from 'react';

export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  side = 'top',
  delay = 200,
  className = ''
}) => {
  const [open, setOpen] = useState(false);
  const timer = useRef<NodeJS.Timeout | null>(null);

  const show = () => {
    timer.current = setTimeout(() => setOpen(true), delay);
  };
  const hide = () => {
    if (timer.current) clearTimeout(timer.current);
    setOpen(false);
  };

  return (
    <span
      className="relative inline-block"
      onMouseEnter={show}
      onFocus={show}
      onMouseLeave={hide}
      onBlur={hide}
    >
      {children}
      {open && (
        <span
          role="tooltip"
          className={`absolute z-50 min-w-[110px] text-xs shadow-lg rounded px-2 py-1 border border-border bg-background-2 text-foreground dark:bg-background-1 dark:text-foreground dark:border-border-1 transition-opacity pointer-events-none ${
            side === 'top'
              ? 'bottom-full left-1/2 -translate-x-1/2 mb-2'
              : side === 'bottom'
              ? 'top-full left-1/2 -translate-x-1/2 mt-2'
              : side === 'left'
              ? 'right-full top-1/2 -translate-y-1/2 mr-2'
              : 'left-full top-1/2 -translate-y-1/2 ml-2'
          } ${className}`}
        >
          {content}
        </span>
      )}
    </span>
  );
};
