// Popover component simplified with wrapper span for consistent typing
import React, { useState, useRef, useEffect, ReactNode } from 'react';

export interface PopoverProps {
  trigger: ReactNode;
  content: ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export const Popover: React.FC<PopoverProps> = ({ trigger, content, side = 'bottom', className = '' }) => {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        contentRef.current && !contentRef.current.contains(target) &&
        triggerRef.current && !triggerRef.current.contains(target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  // Focus content on open
  useEffect(() => {
    if (open && contentRef.current) contentRef.current.focus();
  }, [open]);

  const toggleOpen = () => setOpen(o => !o);

  return (
    <span className="relative inline-block">
      <span
        ref={triggerRef}
        role="button"
        tabIndex={0}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={toggleOpen}
        className="inline-block"
      >
        {trigger}
      </span>
      {open && (
        <div
          ref={contentRef}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          className={`absolute z-40 min-w-[200px] shadow-xl rounded-md py-2 px-3 bg-background border border-border text-foreground animate-fade-in ${
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
        </div>
      )}
    </span>
  );
};