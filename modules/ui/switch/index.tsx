import * as RadixSwitch from '@radix-ui/react-switch';
import clsx from 'clsx';
import React from 'react';

export type SwitchSize = 'sm' | 'md' | 'lg';

const SIZE_CONFIG = {
  sm: {
    root: 'h-5 w-9',
    thumb: 'h-4 w-4',
    translate: 'translate-x-4',
  },
  md: {
    root: 'h-6 w-11',
    thumb: 'h-5 w-5',
    translate: 'translate-x-5',
  },
  lg: {
    root: 'h-8 w-15',
    thumb: 'h-7 w-7',
    translate: 'translate-x-7',
  },
};

export interface SwitchProps
  extends React.ComponentPropsWithoutRef<typeof RadixSwitch.Root> {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  className?: string;
  size?: SwitchSize;
}

export const Switch: React.FC<SwitchProps> = ({
  checked,
  onCheckedChange,
  disabled = false,
  label,
  className,
  size = 'md',
  ...rest
}) => {
  const sizeConf = SIZE_CONFIG[size] ?? SIZE_CONFIG['md'];
  return (
    <label
      className={clsx(
        'inline-flex items-center gap-2',
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
        className
      )}
    >
      <RadixSwitch.Root
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        className={clsx(
          `relative inline-flex flex-shrink-0 border-2 border-transparent rounded-full`,
          sizeConf.root,
          'transition-colors duration-200 ease-in-out',
          checked
            ? 'bg-emerald-500 dark:bg-emerald-800'
            : 'bg-background dark:bg-background',
          !disabled &&
            'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 dark:focus:ring-emerald-800 focus:ring-offset-white dark:focus:ring-offset-gray-900'
        )}
        {...rest}
      >
        <RadixSwitch.Thumb
          className={clsx(
            'pointer-events-none block rounded-full shadow-lg',
            sizeConf.thumb,
            'transform transition-transform duration-200 ease-in-out',
            checked
              ? 'dark:bg-foreground bg-white'
              : 'dark:bg-foreground-2 bg-gray-200',
            checked ? sizeConf.translate : 'translate-x-0'
          )}
        />
      </RadixSwitch.Root>
      {label && (
        <span className='select-none text-foreground-1 text-sm'>{label}</span>
      )}
    </label>
  );
};
