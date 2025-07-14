import React from 'react';

interface BaseSliderProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    'onChange' | 'type' | 'value'
  > {
  label?: string;
  min?: number;
  max?: number;
  step?: number;
  value: number;
  onChange: (value: number) => void;
}

export const Slider: React.FC<BaseSliderProps> = ({
  label,
  min = 0,
  max = 100,
  step = 1,
  value,
  onChange,
  ...props
}) => {
  const percent = ((value - min) * 100) / (max - min);
  return (
    <div className='flex flex-col w-full max-w-md'>
      {label && (
        <label className='mb-2 text-sm font-medium text-foreground'>
          {label}
        </label>
      )}
      <div className='relative w-full h-8 flex items-center'>
        <input
          type='range'
          min={min}
          max={max}
          step={step}
          value={value}
          aria-label={label}
          onChange={(e) => onChange(Number(e.target.value))}
          className='slider-thumb-modern w-full appearance-none bg-transparent z-10'
          style={{
            // fallback for browsers not supporting CSS vars
            color: 'var(--foreground)',
          }}
          {...props}
        />
        <div
          className='absolute left-0 right-0 top-1/2 -translate-y-1/2 h-2 rounded-full pointer-events-none bg-border-2'
          style={{
            background: `linear-gradient(90deg, var(--foreground) ${percent}%, var(--border-2) ${percent}%)`,
          }}
        />
      </div>
      <style>{`
        .slider-thumb-modern::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 32px;
          height: 32px;
          margin-top: -15px;
          border-radius: 50%;
          background: var(--background);
          box-shadow: 0 2px 8px rgba(0,0,0,0.13), 0 0 0 4px var(--color-border-1);
          border: 2px solid var(--foreground);
          cursor: pointer;
          transition: box-shadow 0.2s, border-color 0.2s;
        }
        .slider-thumb-modern::-webkit-slider-runnable-track {
          height: 2px;
          background: transparent;
          border-radius: 1px;
        }
        .slider-thumb-modern:focus::-webkit-slider-thumb {
          box-shadow: 0 0 0 5px var(--color-border-1), 0 2px 8px rgba(0,0,0,0.13);
          border-color: var(--color-foreground-1);
        }
        /* Firefox */
        .slider-thumb-modern::-moz-range-thumb {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--background);
          box-shadow: 0 2px 8px rgba(0,0,0,0.13), 0 0 0 4px var(--color-border-1);
          border: 2px solid var(--foreground);
          cursor: pointer;
          transition: box-shadow 0.2s, border-color 0.2s;
        }
        .slider-thumb-modern::-moz-range-track {
          height: 2px;
          background: transparent;
          border-radius: 1px;
        }
        .slider-thumb-modern:focus::-moz-range-thumb {
          box-shadow: 0 0 0 5px var(--color-border-1), 0 2px 8px rgba(0,0,0,0.13);
          border-color: var(--color-foreground-1);
        }
        /* Edge/IE */
        .slider-thumb-modern::-ms-thumb {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--background);
          box-shadow: 0 2px 8px rgba(0,0,0,0.13), 0 0 0 4px var(--color-border-1);
          border: 2px solid var(--foreground);
          cursor: pointer;
          transition: box-shadow 0.2s, border-color 0.2s;
        }
        .slider-thumb-modern::-ms-fill-lower {
          background: transparent;
        }
        .slider-thumb-modern::-ms-fill-upper {
          background: transparent;
        }
        .slider-thumb-modern::-ms-tooltip {
          display: none;
        }
        .slider-thumb-modern {
          outline: none;
          background: transparent;
          z-index: 2;
          height: 32px;
        }
      `}</style>
    </div>
  );
};
