// Tabs component (keyboard accessible, animated, customizable)
import React, { useState, KeyboardEvent, useEffect } from 'react';
import clsx from 'clsx';

export interface Tab {
  label: React.ReactNode;
  content: React.ReactNode;
}

export interface TabsProps {
  tabs: Tab[];
  defaultActive?: number;
  active?: number;
  onTabChange?: (idx: number) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, defaultActive = 0, active, onTabChange, className }) => {
  const isControlled = typeof active === 'number';
  const [internalActive, setInternalActive] = useState(defaultActive);

  useEffect(() => {
    if (!isControlled) setInternalActive(defaultActive);
  }, [defaultActive, isControlled]);

  const currentActive = isControlled ? active! : internalActive;

  const handleTabSelect = (idx: number) => {
    if (isControlled) {
      onTabChange?.(idx);
    } else {
      setInternalActive(idx);
      onTabChange?.(idx);
    }
  };
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowRight') {
      handleTabSelect((currentActive + 1) % tabs.length);
    } else if (e.key === 'ArrowLeft') {
      handleTabSelect((currentActive - 1 + tabs.length) % tabs.length);
    }
  };
  return (
    <div className={clsx('w-full', className)}>
      <div
        className="flex gap-2 border-b border-border bg-background-1 px-2 py-1 rounded-t-md"
        role="tablist"
        tabIndex={0}
        onKeyDown={handleKeyDown}
      >
        {tabs.map((tab, idx) => (
          <button
            key={typeof tab.label === 'string' ? tab.label : `tab-${idx}`}
            className={clsx(
              'flex items-center gap-2 py-1.5 px-4 font-semibold transition border-b-2 rounded-t-md bg-background-1',
              idx === currentActive
                ? 'border-blue-600 text-blue-600 z-10'
                : 'border-transparent text-foreground-2 hover:text-blue-500 opacity-80 z-0'
            )}
            role="tab"
            aria-selected={idx === currentActive}
            tabIndex={idx === currentActive ? 0 : -1}
            onClick={() => handleTabSelect(idx)}
            style={{ marginBottom: '-2px' }}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="py-3 bg-background-1 rounded-b-md h-full">
        {tabs[currentActive]?.content}
      </div>
    </div>
  );
};
