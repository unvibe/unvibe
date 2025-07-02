import {
  useAPIMutation as useV2M,
  useAPIQuery as useV2Q,
} from '@/server/api/client';
import {
  MdOutlinePushPin,
  MdPushPin,
  MdOutlineArchive,
  MdArchive,
} from 'react-icons/md';
import { ComponentProps, useState, useEffect } from 'react';
import clsx from 'clsx';
import { useParams, useRouter } from '@/lib/next/navigation';
import { Spinner } from '@/modules/ui/spinner';

function ThreadDetailsHeaderButton({ ...props }: ComponentProps<'button'>) {
  return (
    <button
      {...props}
      className={clsx(
        'cursor-pointer flex items-center gap-2 hover:bg-background-2',
        'rounded-[calc(1rem-0.25rem)] p-2',
        props.className
      )}
    />
  );
}

export function ThreadDetailsHeaderActions({
  pinned,
  archived,
  id,
}: {
  pinned?: boolean;
  archived?: boolean;
  id?: string;
}) {
  const { mutate: deleteMutate, isPending } = useV2M('POST /threads/delete');
  const { mutate: pinMutate } = useV2M('POST /threads/pin');
  const params = useParams();
  const projectId =
    typeof params.project_id === 'string' ? params.project_id : '';
  const { refetch } = useV2Q(
    'GET /threads/list',
    {
      projectId,
    },
    !!projectId
  );
  const router = useRouter();

  // Local UI state for optimistic pinning, but always sync with prop
  const [isPinned, setIsPinned] = useState(pinned);
  useEffect(() => {
    setIsPinned(pinned);
  }, [pinned]);

  return (
    <div className='flex flex-col items-center justify-end gap-2 w-full bg-background-1 border-2 border-border rounded-2xl p-1'>
      <ThreadDetailsHeaderButton
        onClick={() => {
          if (!id) return alert('No thread id found');
          deleteMutate(
            { id },
            {
              onSuccess() {
                refetch();
                router.replace(`/project/${projectId}/threads`);
              },
            }
          );
        }}
      >
        {isPending ? (
          <Spinner className='w-6 h-6' />
        ) : archived ? (
          <MdArchive className='w-6 h-6 text-foreground-1' />
        ) : (
          <MdOutlineArchive className='w-6 h-6 text-foreground-2' />
        )}
      </ThreadDetailsHeaderButton>
      {/* Pin button */}
      <ThreadDetailsHeaderButton
        aria-label={isPinned ? 'Unpin thread' : 'Pin thread'}
        onClick={() => {
          if (!id) return alert('No thread id found');
          pinMutate(
            { id, pinned: !isPinned },
            {
              onSuccess() {
                setIsPinned(!isPinned);
                refetch();
              },
            }
          );
        }}
      >
        {isPinned ? (
          <MdPushPin className='w-6 h-6 text-foreground-1' />
        ) : (
          <MdOutlinePushPin className='w-6 h-6 text-foreground-2' />
        )}
      </ThreadDetailsHeaderButton>
    </div>
  );
}

export const HEADER_HEIGHT = 0;

export function ThreadDetailsHeader() {
  return (
    <div className='relative'>
      <div className='absolute inset-x-0 top-0 h-16 z-50 bg-gradient-to-b from-background to-transparent pointer-events-none' />
    </div>
  );
}
