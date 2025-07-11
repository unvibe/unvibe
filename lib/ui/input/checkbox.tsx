import * as RadixCheckbox from '@radix-ui/react-checkbox';
import clsx from 'clsx';
import React from 'react';

interface CheckboxProps
  extends React.ComponentPropsWithoutRef<(typeof RadixCheckbox)['Checkbox']> {
  label?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  label,
  className,
  checked,
  ...props
}) => {
  const id = props.id;
  return (
    <div className='flex items-center space-x-2 select-none cursor-pointer'>
      <RadixCheckbox.Checkbox
        id={id}
        checked={checked}
        className={clsx(
          'relative',
          'w-6 h-6 rounded border border-border flex items-center justify-center transition-colors duration-150 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer',
          checked ? 'bg-blue-600' : 'bg-background',
          className
        )}
        {...props}
      >
        <RadixCheckbox.Indicator className='flex items-center justify-center text-background absolute inset-0 w-full h-full'>
          <svg
            width='20'
            height='20'
            viewBox='0 0 20 20'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
          >
            <path
              d='M5.5 10.5L9 14L15 7'
              stroke='currentColor'
              strokeWidth='2.2'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
          </svg>
        </RadixCheckbox.Indicator>
      </RadixCheckbox.Checkbox>
      {label && (
        <label
          htmlFor={id}
          className='text-base text-foreground cursor-pointer'
        >
          {label}
        </label>
      )}
    </div>
  );
};
