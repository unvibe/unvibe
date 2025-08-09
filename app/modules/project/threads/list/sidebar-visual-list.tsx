import { useAPIQuery } from '@/server/api/client';
import { Spinner } from '@/lib/ui/spinner';
import { useParams, usePathname, useRouter } from '@/lib/next/navigation';
import type { Thread } from '@/server/db/schema';
import { HiPlus } from 'react-icons/hi2';
import Link from '@/lib/next/link';
import clsx from 'clsx';
import { TiMessage } from 'react-icons/ti';
import { MdPushPin } from 'react-icons/md';

export function SidebarVisualThreadList() {
  const projectId = useParams().project_id;
  const { data, isFetching } = useAPIQuery(
    'GET /threads/list',
    {
      projectId: typeof projectId === 'string' ? projectId : '',
      type: 'visual',
    },
    !!projectId
  );
  const router = useRouter();

  if (isFetching) {
    return (
      <div className='flex items-center justify-center py-8'>
        <Spinner className='w-10 h-10' />
      </div>
    );
  }

  // Sort: pinned first, then newest
  const sortedThreads = data?.threads?.slice().sort((a, b) => {
    if (!!a.pinned === !!b.pinned) {
      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }
    return b.pinned ? 1 : -1;
  });

  return (
    <div className='grid content-start overflow-y-auto h-full w-full'>
      <div className='flex justify-between items-center sticky top-0 bg-background-1 p-2 z-10'>
        <h3 className='flex gap-2 items-center py-1'>
          <TiMessage className='w-6 h-6 text-foreground-2' />
          <span>Threads</span>
        </h3>
        <button
          className='bg-background-1 p-1 rounded-md cursor-pointer'
          onClick={() => {
            router.push(`/projects/${projectId}`);
          }}
        >
          <HiPlus className='w-6 h-6' />
        </button>
      </div>
      <div className='grid content-start gap-1 p-2 pt-0'>
        {sortedThreads?.map((thread) => (
          <ThreadListCard
            key={thread.id}
            data={thread}
            projectId={typeof projectId === 'string' ? projectId : ''}
          />
        ))}

        {data?.threads?.length === 0 && (
          <div className='text-center italic text-foreground-2 h-full py-8'>
            [[ EMPTY ]]
          </div>
        )}
      </div>
    </div>
  );
}

function ThreadListCard({
  data: thread,
  projectId,
}: {
  data: Thread;
  projectId: string;
}) {
  const pathname = usePathname();
  const isVisual = pathname.startsWith(`/projects/${projectId}/visual`);
  const href = `/projects/${projectId}/${isVisual ? 'visual' : 'threads'}/${thread.id}`;
  const isActive = pathname === href;
  return (
    <Link href={href} className='group'>
      <div
        className={clsx(
          isActive ? 'bg-background-2 text-foreground-1' : 'text-foreground-2',
          'p-2 rounded-xl bg-background-1 grid relative'
        )}
      >
        {/* Pin icon if pinned */}
        {thread.pinned && (
          <MdPushPin className='absolute top-2 right-2 w-4 h-4 dark:text-red-700 text-red-600 transform rotate-45' />
        )}
        {/* <span
          className={clsx(
            'text-sm',
            isActive ? 'text-blue-400 dark:text-blue-600' : 'text-foreground-2'
          )}
        >
          {new Date(thread.created_at).toLocaleDateString()}
        </span> */}
        <span className={clsx('line-clamp-2')}>{thread.title}</span>
      </div>
    </Link>
  );
}
