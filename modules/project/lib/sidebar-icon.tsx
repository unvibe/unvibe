import Link from '@/lib/next/link';
import { IconType } from 'react-icons/lib';

export function SidebarIcon({
  href,
  Icon,
  onClick,
  active,
  badge,
}: {
  href?: string;
  active?: boolean;
  onClick?: () => void;
  Icon: IconType;
  badge?: number;
}) {
  if (onClick) {
    return (
      <div className='p-2.5 bg-background-1 rounded-lg mt-2 relative'>
        {active && (
          <div className='absolute top-1 left-1 bg-blue-500 rounded-full overflow-hidden'>
            <span className='block w-1.5 h-1.5' />
          </div>
        )}
        {badge ? (
          <div className='absolute -top-1.5 -right-2 bg-foreground-2 text-background rounded-full overflow-hidden'>
            <span className='text-[10px] min-w-4 px-1 h-4 flex items-center justify-center font-mono'>
              {badge}
            </span>
          </div>
        ) : null}
        <button
          onClick={onClick}
          className='text-foreground-2 flex items-center justify-center cursor-pointer'
        >
          <Icon className='w-6 h-6' />
        </button>
      </div>
    );
  } else if (href) {
    return (
      <div className='p-2.5 bg-background-1 rounded-lg mt-2 relative'>
        {active && (
          <div className='absolute top-1 left-1 bg-blue-500 rounded-full overflow-hidden'>
            <span className='block w-1.5 h-1.5' />
          </div>
        )}
        {badge ? (
          <div className='absolute -top-1.5 -right-2 bg-foreground-2 text-background rounded-full overflow-hidden'>
            <span className='text-[10px] min-w-4 px-1 h-4 flex items-center justify-center font-mono'>
              {badge}
            </span>
          </div>
        ) : null}
        <Link
          href={href}
          className='text-foreground-2 flex items-center justify-center cursor-pointer'
        >
          <Icon className='w-6 h-6' />
        </Link>
      </div>
    );
  }

  throw new Error('Either href or onClick must be provided for SideIcon');
}

export function SidebarIconsGroup({ children }: { children: React.ReactNode }) {
  return (
    <div className='border-b-2 border-border border-dashed pb-2'>
      {children}
    </div>
  );
}
