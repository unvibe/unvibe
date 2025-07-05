import clsx from 'clsx';

interface ProgressProps {
  progress?: number;
  size?: number;
  strokeWidth?: number;
  emptyStrokeWidthOffset?: number;
  filledStrokeWidthOffset?: number;
  emptyClassName?: string;
  filledClassName?: string;
}

export function Progress({
  progress = 1,
  size = 20,
  strokeWidth = size / 5,
  emptyStrokeWidthOffset = 0,
  filledStrokeWidthOffset = 0,
  emptyClassName = 'text-background-1',
  filledClassName = 'dark:text-emerald-600 text-emerald-500',
}: ProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={clsx('rotate-90 ltr:rotate-90 rtl:-rotate-90')}
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke='currentColor'
        strokeWidth={strokeWidth + emptyStrokeWidthOffset}
        className={emptyClassName}
        fill='none'
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke='currentColor'
        strokeWidth={strokeWidth + filledStrokeWidthOffset}
        className={filledClassName}
        fill='none'
        strokeDasharray={circumference}
        strokeDashoffset={circumference * (1 - progress / 100)}
        strokeLinecap='round'
        style={{ transition: 'stroke-dashoffset 0.35s' }}
      />
    </svg>
  );
}
