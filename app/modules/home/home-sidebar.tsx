import Link from '@/lib/next/link';
import {
  TiHomeOutline,
  TiFolder,
  TiPlug,
  TiBrush,
  TiCogOutline,
  TiDocumentText,
  TiLightbulb,
  TiDatabase,
} from 'react-icons/ti';
import { IconType } from 'react-icons/lib';
import { usePathname } from '@/lib/next/navigation';
import { MdInfoOutline, MdSync } from 'react-icons/md';
import React from 'react';
import { useAPIMutation } from '@/server/api/client';
import clsx from 'clsx';
import { useEnvironmentStatus } from '~/routes/(home)/home/environment/useEnvironmentStatus';

function SideIcon({
  href,
  Icon,
  active,
  children,
  indicatorColor,
  indicatorStyle = {},
}: {
  href?: string;
  active?: boolean;
  Icon: IconType | React.FC<{ size?: number }>;
  children?: React.ReactNode;
  indicatorColor?: string;
  indicatorStyle?: React.CSSProperties;
}) {
  return (
    <div
      className={`p-2.5 bg-background-1 rounded-lg mt-2 relative cursor-pointer`}
    >
      {active && (
        <div
          className='absolute top-1 left-1 bg-blue-500 rounded-full overflow-hidden'
          style={indicatorStyle}
        >
          <span className='block w-1.5 h-1.5' />
        </div>
      )}
      {indicatorColor && (
        <div className='absolute bottom-3 right-2 box-border'>
          <div
            className={clsx(
              'w-2 h-2 outline-3 outline-background-1 rounded-full',
              indicatorColor
            )}
          />
        </div>
      )}
      {href ? (
        <Link
          href={href}
          className='text-foreground-2 flex items-center justify-center'
        >
          <Icon size={24} />
          {children}
        </Link>
      ) : (
        <span className='text-foreground-2 flex items-center justify-center'>
          <Icon size={24} />
          {children}
        </span>
      )}
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

function EnvironmentStatus() {
  const status = useEnvironmentStatus();
  if (status) return null;
  return (
    <span className='bg-amber-900 p-1.5 rounded-lg border border-amber-500'>
      <MdInfoOutline className='text-amber-500' />
    </span>
  );
}

type NavItem = {
  label: string;
  href: string;
  Icon: IconType | React.FC<{ size?: number }>;
  Status?: React.FC;
};

const HOME_NAV_ITEMS: NavItem[] = [
  { label: 'Projects', href: '/home/projects', Icon: TiFolder },
  { label: 'Plugins', href: '/home/plugins', Icon: TiPlug },
  { label: 'Themes', href: '/home/themes', Icon: TiBrush },
  {
    label: 'Environment',
    href: '/home/environment',
    Icon: TiCogOutline,
    Status: EnvironmentStatus,
  },
  { label: 'Models', href: '/home/models', Icon: TiLightbulb },
  { label: 'Database', href: '/home/database', Icon: TiDatabase },
];

const DOCS_NAV_ITEMS: NavItem[] = [
  {
    label: 'Getting Started',
    href: '/home/docs/getting-started',
    Icon: TiDocumentText,
  },
];

export function HomeSidebar() {
  const pathname = usePathname();
  const isHome = pathname.startsWith('/home') && pathname !== '/home/docs';
  const isDocs = pathname.startsWith('/home/docs');

  // --- Sync logic
  // Force the type for mutation input as void
  const syncMutation = useAPIMutation('POST /home/sync-update');
  let syncStatus: 'up-to-date' | 'needs-update' | 'updating' = 'up-to-date';
  if (syncMutation.isPending) syncStatus = 'updating';
  else if (syncMutation.isError) syncStatus = 'needs-update';
  else if (syncMutation.isSuccess) syncStatus = 'up-to-date';

  const syncColor =
    syncStatus === 'up-to-date'
      ? 'bg-emerald-500'
      : syncStatus === 'needs-update'
        ? 'bg-rose-500'
        : 'bg-yellow-500';

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
            <SideIcon href='/home/docs' Icon={TiDocumentText} active={isDocs} />
          </SideIconGroup>
          <button
            type='button'
            tabIndex={-1}
            style={{ all: 'unset', display: 'block' }}
            onClick={() =>
              syncMutation.mutate({} as never, {
                onSuccess: (data) => {
                  console.log(data.logs);
                },
              })
            }
            disabled={syncStatus === 'updating'}
            title={
              syncMutation.isError
                ? 'Sync failed!'
                : syncMutation.isSuccess
                  ? 'Up to date!'
                  : 'Sync now'
            }
          >
            <SideIcon
              href={undefined}
              Icon={MdSync}
              indicatorColor={import.meta.env.DEV ? 'bg-purple-500' : syncColor}
            />
          </button>
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
                    className={`flex justify-between text-sm items-center gap-3 p-2 rounded-lg hover:bg-background-2 transition-colors ${isActive ? 'bg-background-2 font-bold' : ''}`}
                  >
                    <div className='flex items-center gap-2'>
                      <item.Icon className='w-6 h-6 text-foreground-2 shrink-0' />
                      <span>{item.label}</span>
                    </div>
                    {'Status' in item && item.Status && <item.Status />}
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
