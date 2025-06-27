// DatePicker (styled native, accessible, can swap for 3rd party later)
import React from 'react';

export interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  className?: string;
  min?: string;
  max?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({ value, onChange, label, className = '', min, max }) => (
  <label className={className}>
    {label && <span className="block font-medium text-sm mb-1">{label}</span>}
    <input
      type="date"
      value={value}
      min={min}
      max={max}
      onChange={e => onChange(e.target.value)}
      className="px-3 py-2 rounded-md border border-border bg-background-1 text-foreground focus:ring-2 ring-blue-200 focus:outline-none shadow-sm w-full min-w-[180px]"
    />
  </label>
);
