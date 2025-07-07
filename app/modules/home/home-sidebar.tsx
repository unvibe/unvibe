import Link from '@/lib/next/link';
import {
  TiHomeOutline,
  TiFolder,
  TiPlug,
  TiBrush,
  TiCogOutline,
  TiDocumentText,
} from 'react-icons/ti';
import { IconType } from 'react-icons/lib';
import { usePathname } from '@/lib/next/navigation';
import { PixelSyncIcon } from '@/lib/ui/pixel-icons/PixelSyncIcon';
import React from 'react';

function SideIcon({
  href,
  Icon,
  active,
  children,
  indicatorColor,
}: {
  href: string;
  active?: boolean;
  Icon: IconType | React.FC<{ size?: number }>;
  children?: React.ReactNode;
  indicatorColor?: string;
}) {
  return (
    <div className={`p-2.5 bg-background-1 rounded-lg mt-2 relative`}>
      {active && (
        <div className='absolute top-1 left-1 bg-blue-500 rounded-full overflow-hidden'>
          <span className='block w-1.5 h-1.5' />
        </div>
      )}
      {indicatorColor && (
        <span
          className={`absolute top-1 right-1 w-2 h-2 rounded-full`}
          style={{ background: indicatorColor, border: '2px solid white' }}
        />
      )}
      <Link
        href={href}
        className='text-foreground-2 flex items-center justify-center'
      >
        <Icon size={24} />
        {children}
      </Link>
    </div>
  );
}

function SideIconGroup({ children }: { children: React.ReactNode }) {
  return (
    <div className='border-b-2 border-border border-dashed pb-2'>
      {children}
    </div>
  );
}

const HOME_NAV_ITEMS = [
  { label: 'Projects', href: '/home/projects', Icon: TiFolder },
  { label: 'Plugins', href: '/home/plugins', Icon: TiPlug },
  { label: 'Themes', href: '/home/themes', Icon: TiBrush },
  { label: 'Environment', href: '/home/environment', Icon: TiCogOutline },
];

const DOCS_NAV_ITEMS = [
  {
    label: 'Getting Started',
    href: '/home/docs/getting-started',
    Icon: TiDocumentText,
  },
];

// Mock sync status hook
type SyncStatus = 'up-to-date' | 'needs-update' | 'updating';
function useSyncStatus(): [SyncStatus, () => void] {
  // TODO: connect to backend or use git info
  const [status, setStatus] = React.useState<SyncStatus>('up-to-date');
  const triggerUpdate = () => {
    setStatus('updating');
    setTimeout(() => setStatus('up-to-date'), 2000); // Mock update delay
  };
  return [status, triggerUpdate];
}

export function HomeSidebar() {
  const pathname = usePathname();
  const isHome = pathname.startsWith('/home') && pathname !== '/home/docs';
  const isDocs = pathname.startsWith('/home/docs');
  const [syncStatus, triggerSync] = useSyncStatus();
  const syncColor =
    syncStatus === 'up-to-date'
      ? '#27c93f'
      : syncStatus === 'needs-update'
        ? '#ff1744'
        : '#ffd600';

  return (
    <div className='grid content-start h-screen shrink-0 w-full p-5 py-8'>
      <div className='h-[calc(100vh-4rem)] overflow-hidden flex items-stretch gap-4'>
        <div className='border-2 border-transparent'>
          <SideIconGroup>
            <SideIcon
              href={'/home/projects'}
              Icon={TiHomeOutline}
              active={isHome}
            />
            {/* Sync button */}
            <button
              type='button'
              tabIndex={-1}
              style={{ all: 'unset', display: 'block' }}
              onClick={triggerSync}
            >
              <SideIcon
                href={'#'}
                Icon={PixelSyncIcon}
                indicatorColor={syncColor}
              />
            </button>
          </SideIconGroup>
          <SideIcon href='/home/docs' Icon={TiDocumentText} active={isDocs} />
        </div>
        <div className='border-2 border-border rounded-2xl overflow-hidden w-full bg-background-1'>
          <div className='grid content-start overflow-y-auto h-full w-full overflow-x-hidden'>
            <nav className='flex flex-col gap-1 p-2'>
              {(isHome ? HOME_NAV_ITEMS : DOCS_NAV_ITEMS).map((item) => {
                const isActive =
                  pathname === item.href ||
                  pathname.startsWith(item.href + '/');
                return (
                  <Link
                    href={item.href}
                    key={item.href}
                    passHref
                    legacyBehavior
                    className={`flex text-sm items-center gap-3 p-2 rounded-lg hover:bg-background-2 transition-colors ${isActive ? 'bg-background-2 font-bold' : ''}`}
                  >
                    <item.Icon className='w-6 h-6 text-foreground-2 shrink-0' />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}
