import * as React from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import clsx from 'clsx';
import {
  HiChevronDown as ChevronDownIcon,
  HiMiniCheckCircle,
} from 'react-icons/hi2';

export type SelectOption = { value: string; label: string };
export type SelectGroup = {
  label: string;
  options: SelectOption[];
  icon?: React.ReactNode;
};

interface SelectProps {
  label?: string;
  options: SelectOption[] | SelectGroup[];
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  style?: React.CSSProperties;
  trigger?: string;
  chevron?: string;
}

function isGroupedOptions(
  options: SelectOption[] | SelectGroup[]
): options is SelectGroup[] {
  return (
    Array.isArray(options) && options.length > 0 && 'options' in options[0]
  );
}

// Helper to find the label and groupIcon for a value
function findOptionLabelAndGroupIcon(
  options: SelectOption[] | SelectGroup[],
  value: string | undefined
): { label?: string; groupIcon?: React.ReactNode } {
  if (!value) return {};
  if (isGroupedOptions(options)) {
    for (const group of options) {
      for (const option of group.options) {
        if (option.value === value) {
          return { label: option.label, groupIcon: group.icon };
        }
      }
    }
  } else {
    for (const option of options as SelectOption[]) {
      if (option.value === value) {
        return { label: option.label };
      }
    }
  }
  return {};
}

// Custom value display component for SelectPrimitive.Value
const SelectValueDisplay: React.FC<{
  value: string | undefined;
  options: SelectOption[] | SelectGroup[];
  placeholder?: string;
}> = ({ value, options, placeholder }) => {
  if (!value) {
    return <span className='text-foreground-2 truncate'>{placeholder}</span>;
  }
  const { label: selectedLabel, groupIcon } = findOptionLabelAndGroupIcon(
    options,
    value
  );
  return (
    <span className='flex items-center gap-1 min-w-0 flex-1'>
      {groupIcon && <span className='inline-flex'>{groupIcon}</span>}
      <span className='truncate'>{selectedLabel}</span>
    </span>
  );
};

const defaultTrigger = clsx(
  'hover:bg-background-2 hover:border-foreground transition-colors duration-200 ease-in-out font-semibold text-foreground-2',
  'rounded-xl border-2 border-border bg-background-2 py-2 px-3 text-sm leading-none shadow-sm'
);

export const Select: React.FC<SelectProps> = ({
  label,
  options,
  placeholder,
  value,
  onChange,
  style,
  trigger = defaultTrigger,
  chevron = 'w-5 h-5',
}) => {
  const selectValue = value && value !== '' ? value : undefined;

  return (
    <div className='flex flex-col' style={style}>
      {label && (
        <label className='text-sm font-medium text-foreground mb-1'>
          {label}
        </label>
      )}
      <SelectPrimitive.Root value={selectValue} onValueChange={onChange}>
        <SelectPrimitive.Trigger
          className={clsx(
            'flex items-center justify-between focus:outline-none focus:border-foreground',
            'cursor-pointer gap-1',
            trigger
          )}
        >
          <SelectPrimitive.Value
            placeholder={placeholder}
            className='overflow-ellipsis'
          >
            <SelectValueDisplay
              value={selectValue}
              options={options}
              placeholder={placeholder}
            />
          </SelectPrimitive.Value>
          <SelectPrimitive.Icon className='text-foreground-2 flex gap-1'>
            {/* {selectValue && <HiMiniCheckCircle className='w-5 h-5' />} */}
            <ChevronDownIcon className={chevron} />
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>
        <SelectPrimitive.Portal>
          <SelectPrimitive.Content className='top-10 bg-background-1 border border-border shadow-lg rounded-md z-50 p-1'>
            <SelectPrimitive.Viewport>
              {isGroupedOptions(options)
                ? options.map((group, i) => (
                    <React.Fragment key={group.label + i}>
                      <div className='p-2 text-xs font-semibold text-foreground-2 flex items-center gap-1'>
                        {group.icon && (
                          <span className='inline-flex'>{group.icon}</span>
                        )}
                        {group.label}
                      </div>
                      {group.options.map((option) => (
                        <SelectPrimitive.Item
                          key={option.value}
                          value={option.value}
                          className='flex items-center justify-between p-2 hover:bg-background-2 focus:bg-blue-500 focus:text-white dark:focus:bg-blue-800 dark:focus:text-blue-200 rounded transition duration-150 ease-in-out text-foreground text-sm'
                        >
                          <SelectPrimitive.ItemText>
                            {option.label}
                          </SelectPrimitive.ItemText>
                          <SelectPrimitive.ItemIndicator className='flex items-center'>
                            <HiMiniCheckCircle className='text-blue-500 dark:text-blue-300 w-5 h-5' />
                          </SelectPrimitive.ItemIndicator>
                        </SelectPrimitive.Item>
                      ))}
                    </React.Fragment>
                  ))
                : (options as SelectOption[]).map((option) => (
                    <SelectPrimitive.Item
                      key={option.value}
                      value={option.value}
                      className='flex items-center justify-between p-2 hover:bg-background-2 focus:bg-blue-500 focus:text-white dark:focus:bg-blue-800 dark:focus:text-blue-200 rounded transition duration-150 ease-in-out text-foreground'
                    >
                      <SelectPrimitive.ItemText className='text-sm'>
                        {option.label}
                      </SelectPrimitive.ItemText>
                      <SelectPrimitive.ItemIndicator className='flex items-center'>
                        <HiMiniCheckCircle className='text-blue-500 dark:text-blue-300 w-5 h-5' />
                      </SelectPrimitive.ItemIndicator>
                    </SelectPrimitive.Item>
                  ))}
            </SelectPrimitive.Viewport>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>
    </div>
  );
};
