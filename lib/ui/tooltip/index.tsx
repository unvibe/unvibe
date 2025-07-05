// Tooltip component using Radix UI primitives with Tailwind styling and theme support
import * as React from 'react';
import * as RadixTooltip from '@radix-ui/react-tooltip';
import clsx from 'clsx';

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
  className = '',
}) => {
  return (
    <RadixTooltip.Provider delayDuration={delay}>
      <RadixTooltip.Root>
        <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
        <RadixTooltip.Portal>
          <RadixTooltip.Content
            side={side}
            sideOffset={8}
            className={clsx(
              'p-4 rounded-xl border border-border bg-background-2 text-foreground-1 text-xs whitespace-pre-wrap font-mono',
              `z-50 min-w-[100px] max-w-[500px] shadow-lg ` +
                `transition-opacity pointer-events-auto ${className}`
            )}
          >
            {content}
            <RadixTooltip.Arrow className='fill-border dark:fill-border-1' />
          </RadixTooltip.Content>
        </RadixTooltip.Portal>
      </RadixTooltip.Root>
    </RadixTooltip.Provider>
  );
};
