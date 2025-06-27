import clsx from 'clsx';
import * as RadixProgress from '@radix-ui/react-progress';

interface ProgressProps {
  progress?: number;
  size?: number;
  width?: number | 'auto';
}

export function Progress({
  progress = 0,
  size = 40,
  width = 'auto',
}: ProgressProps) {
  return (
    <RadixProgress.Root
      style={{
        height: size,
        width,
      }}
      className={clsx(
        'overflow-hidden relative w-full [transform:translateZ(0)]',
        'bg-background rounded-2xl h-10'
      )}
      value={progress}
    >
      <RadixProgress.Indicator
        className={clsx(
          'relative w-full h-full [transition:_transform_660ms_cubic-bezier(0.65,0,0.35,1)]',
          'theme-green bg-foreground-2'
        )}
        style={{ transform: `translateX(-${100 - progress}%)` }}
      />
    </RadixProgress.Root>
  );
}
