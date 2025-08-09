import { useAPIQuery } from '@/server/api/client';
import { useParams, usePathname } from '@/lib/next/navigation';
import type { Thread } from '@/server/db/schema';
import Link from '@/lib/next/link';
import clsx from 'clsx';
import { TiArchive } from 'react-icons/ti';
import { MdPushPin } from 'react-icons/md';

export function SidebarArchiveList() {
  const { data } = useAPIQuery('GET /threads/list', {
    archived: true,
    projectId: useParams().project_id as string,
    type: 'thread',
  });

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
    <div className='grid overflow-y-auto'>
      <div className='flex justify-between items-center sticky top-0 p-2 z-10'>
        <h3 className='font-mono flex gap-2 items-center py-1'>
          <TiArchive className='w-6 h-6 text-foreground-2' />
          <span>Archive</span>
        </h3>
      </div>
      <div className='grid content-start gap-1 p-2 pt-0'>
        {sortedThreads?.map((thread) => (
          <ThreadListCard key={thread.id} data={thread} />
        ))}
      </div>
    </div>
  );
}

function ThreadListCard({ data: thread }: { data: Thread }) {
  const pathname = usePathname();
  const projectId = useParams().project_id as string;
  const isActive = pathname === `/threads-archive/${thread.id}`;
  return (
    <Link
      href={`/projects/${projectId}/threads-archive/${thread.id}`}
      className='group'
    >
      <div className='p-2 rounded-xl bg-background-1 grid relative'>
        {/* Pin icon if pinned */}
        {thread.pinned && (
          <MdPushPin className='absolute top-2 right-2 w-5 h-5 text-blue-600' />
        )}
        <span
          className={clsx(
            'text-[10px] font-mono',
            isActive ? 'text-blue-400 dark:text-blue-600' : 'text-foreground-2'
          )}
        >
          {new Date(thread.created_at).toLocaleDateString()}
        </span>
        <span
          className={clsx(
            'font-mono text-sm line-clamp-2',
            isActive ? 'text-blue-600 dark:text-blue-400' : 'text-foreground-1'
          )}
        >
          {thread.title}
        </span>
      </div>
    </Link>
  );
}
