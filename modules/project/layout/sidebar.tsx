import { SidebarThreadList } from '../threads/list/sidebar-threads-list';
import { SidebarArchiveList } from '../threads/list/sidebar-archive-list';
import {
  TiArchive,
  TiBrush,
  // TiDocumentText,
  TiFolder,
  TiHomeOutline,
  TiMessage,
  // TiSpannerOutline,
} from 'react-icons/ti';
import { useCallback, useMemo } from 'react';
import { SidebarToolsList } from '../tools/sidebar-tools-list';
import { useParams, usePathname } from '@/lib/next/navigation';
import { SidebarFilesList } from '../files/sidebar-files-list';
import { SidebarPluginsList } from '../plugins-context/sidebar-plugins-list';
import { SidebarThemesList } from '../themes/sidebar-themes-list';
import { SidebarIcon, SidebarIconsGroup } from '../lib/sidebar-icon';
import { TbAdjustmentsHorizontal } from 'react-icons/tb';

export function ProjectLayoutSidebar() {
  const pathname = usePathname();
  const projectId = useParams().project_id as string;
  const url = useCallback(
    (resource: string) => {
      return `/projects/${projectId}/${resource}`;
    },
    [projectId]
  );
  const compUrl = useCallback(
    (resource: string) => {
      return pathname.startsWith(url(resource));
    },
    [pathname, url]
  );
  const active = useMemo<
    'threads' | 'archive' | 'tools' | 'plugins' | 'files' | 'themes'
  >(() => {
    if (compUrl('archive')) return 'archive';
    if (compUrl('threads')) return 'threads';
    if (compUrl('tools')) return 'tools';
    if (compUrl('plugins')) return 'plugins';
    if (compUrl('files')) return 'files';
    if (compUrl('themes')) return 'themes';
    return 'threads';
  }, [compUrl]);

  const Component = useMemo(() => {
    switch (active) {
      case 'threads':
        return SidebarThreadList;
      case 'archive':
        return SidebarArchiveList;
      case 'tools':
        return SidebarToolsList;
      case 'files':
        return SidebarFilesList;
      case 'plugins':
        return SidebarPluginsList;
      case 'themes':
        return SidebarThemesList;
      default:
        return null;
    }
  }, [active]);

  return (
    <div className='grid content-start h-screen shrink-0 w-full p-5 py-8'>
      <div className='h-[calc(100vh-4rem)] overflow-hidden flex items-stretch gap-4'>
        <div className='border-2 border-transparent'>
          <SidebarIconsGroup>
            <SidebarIcon href={'/'} Icon={TiHomeOutline} />
          </SidebarIconsGroup>
          <SidebarIconsGroup>
            <SidebarIcon
              Icon={TiMessage}
              href={url('threads')}
              active={compUrl('threads')}
            />
            <SidebarIcon
              Icon={TiFolder}
              href={url('files')}
              active={compUrl('files')}
            />
          </SidebarIconsGroup>
          <SidebarIconsGroup>
            {/* <SidebarIcon
              Icon={TiSpannerOutline}
              href={url('tools')}
              active={compUrl('tools')}
            />
            <SidebarIcon
              Icon={TiDocumentText}
              href={url('system')}
              active={compUrl('system')}
            /> */}
            <SidebarIcon
              Icon={TbAdjustmentsHorizontal}
              href={url('plugins')}
              active={compUrl('plugins')}
            />
          </SidebarIconsGroup>
          <SidebarIcon
            Icon={TiBrush}
            href={url('themes')}
            active={compUrl('themes')}
          />
          <SidebarIcon
            Icon={TiArchive}
            href={url('archive')}
            active={compUrl('archive')}
          />
        </div>
        <div className='border-2 border-border rounded-2xl overflow-hidden w-full bg-background-1'>
          {Component && <Component />}
        </div>
      </div>
    </div>
  );
}
