import { useAPIQuery } from '@/server/api/client';
import clsx from 'clsx';
import Link from '@/lib/next/link';
import { useParams, usePathname } from '@/lib/next/navigation';
import { TiSpannerOutline } from 'react-icons/ti';

export function useToolsList() {
  const params = useParams();
  const projectId =
    typeof params.project_id === 'string' ? params.project_id : '';
  return useAPIQuery('GET /tools-tester/list', {
    projectDirname: projectId,
    source: 'projects',
  });
}

export function SidebarToolsList() {
  const params = useParams();
  const projectId =
    typeof params.project_id === 'string' ? params.project_id : '';
  const pathname = usePathname();
  const { data } = useToolsList();

  return (
    <div className='shrink-0 overflow-y-auto grid gap-1 content-start text-sm'>
      <div className='grid overflow-y-auto'>
        <div className='flex justify-between items-center sticky top-0 p-2 z-10'>
          <h3 className='font-mono flex gap-2 items-center py-1'>
            <TiSpannerOutline className='w-6 h-6 text-foreground-2' />
            <span>Tools</span>
          </h3>
        </div>
        <div className='grid content-start gap-1 p-2 pt-0'>
          {data?.tools.map((tool) => {
            const href = `/projects/${projectId}/tools/${tool.name}`;
            const isActive = pathname === href;
            return (
              <Link href={href} key={tool.name} className='bg-background-1 p-2'>
                <div className='text-xs font-mono text-foreground-2'>
                  By {tool.pluginName}
                </div>
                <div
                  className={clsx(
                    'font-mono',
                    isActive
                      ? 'text-blue-400 dark:text-blue-600'
                      : 'text-foreground-1'
                  )}
                >
                  {tool.name}
                </div>
                <div
                  className={clsx(
                    'pt-1 line-clamp-2 font-mono text-xs',
                    isActive
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-foreground-2'
                  )}
                >
                  {tool.description}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
