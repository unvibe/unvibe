import * as RadixRadioGroup from '@radix-ui/react-radio-group';
import clsx from 'clsx';
import React from 'react';

interface RadioGroupProps extends React.ComponentPropsWithoutRef<typeof RadixRadioGroup.Root> {
  options: { label: string; value: string }[];
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({ options, value, onValueChange, className, ...props }) => {
  return (
    <RadixRadioGroup.Root
      value={value}
      onValueChange={onValueChange}
      className={clsx('flex flex-col gap-2', className)}
      {...props}
    >
      {options.map((option) => (
        <label key={option.value} className="flex items-center space-x-2 select-none cursor-pointer">
          <RadixRadioGroup.Item
            value={option.value}
            className={clsx(
              'w-6 h-6 min-w-6 min-h-6 max-w-6 max-h-6 rounded-full border border-border flex items-center justify-center transition-colors duration-150 outline-none focus:ring-2 focus:ring-blue-500',
              value === option.value ? 'bg-blue-600' : 'bg-background'
            )}
          >
            <RadixRadioGroup.Indicator className="flex items-center justify-center w-6 h-6">
              <span className="block w-3 h-3 rounded-full bg-background" />
            </RadixRadioGroup.Indicator>
          </RadixRadioGroup.Item>
          <span className="text-base text-foreground">{option.label}</span>
        </label>
      ))}
    </RadixRadioGroup.Root>
  );
};
