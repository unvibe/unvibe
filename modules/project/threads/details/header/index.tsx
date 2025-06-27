import {
  useAPIMutation as useV2M,
  useAPIQuery as useV2Q,
} from '@/server/api/client';
import {
  MdOutlinePushPin,
  MdPushPin,
  MdOutlineArchive,
  MdArchive,
  MdOutlineSettings,
  MdSettings,
  MdClose,
  MdOutlineVisibility,
  MdOutlineVisibilityOff,
} from 'react-icons/md';
import { ComponentProps, useState, useEffect } from 'react';
import clsx from 'clsx';
import { useParams, useRouter } from '@/lib/next/navigation';
import { Spinner } from '@/modules/ui/spinner';
import { Popover } from 'radix-ui';
import { useProjectActions } from '@/modules/project/provider';
import { text } from '@/modules/ui/text';
import { Switch } from '@/modules/ui';
import { Modal } from '@/modules/ui/modal';
import Timer from '@/modules/ui/timer';
import { useBackedLogStore } from '../../use-backed-log-store';

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

  const actions = useProjectActions();

  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const tagged = useBackedLogStore((state) => state.tagged);
  const format = useBackedLogStore((state) => state.format);
  const { data } = useV2Q('GET /models');
  const logs = format(data?.models ?? [], tagged, id as string);
  return (
    <div className='flex flex-col items-center justify-end gap-2 w-full bg-background-1 border-2 border-border rounded-2xl p-1'>
      <Popover.Root onOpenChange={(state) => setIsActionsOpen(state)}>
        <Popover.Trigger
          className={clsx(
            'cursor-pointer flex items-center gap-2 hover:bg-background-2',
            'rounded-[calc(1rem-0.25rem)] p-2'
          )}
        >
          {isActionsOpen ? (
            <MdSettings className='w-6 h-6 text-foreground-1' />
          ) : (
            <MdOutlineSettings className='w-6 h-6 text-foreground-2' />
          )}
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content className='bg-background-1 rounded-2xl p-5 border-2 border-border relative z-50'>
            <div className='relative grid gap-1'>
              <div className='flex items-center justify-between pb-5'>
                <div className='flex items-center gap-2'>
                  <MdSettings className='w-6 h-6 text-foreground-2' />
                  <text.h4 bold className='text-foreground-2'>
                    Thread Settings
                  </text.h4>
                </div>
                <Popover.Close className='cursor-pointer bg-background p-2 rounded-lg border border-border-2'>
                  <MdClose />
                </Popover.Close>
              </div>
              {actions.diagnosticChecks
                .filter((d) => d.checks.length > 0)
                .map((check) => {
                  return (
                    <div key={check.plugin} className='flex'>
                      <div className='border-e-2 border-border w-[150px] p-2 capitalize font-semibold'>
                        {check.plugin}
                      </div>
                      <div className='ps-4 pb-2'>
                        {check.checks.map((d) => (
                          <div
                            key={d.name}
                            className='flex items-center gap-2 min-w-[300px] justify-between p-2 bg-background-2 rounded-xl'
                          >
                            <span className='font-mono text-sm'>{d.name}</span>
                            <Switch checked={true} onCheckedChange={() => {}} />
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
            </div>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
      <div className='w-4 h-px bg-border' />
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
      <div className='w-4 h-px bg-border' />
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
      <div className='w-4 h-px bg-border' />
      <ThreadDetailsHeaderButton onClick={() => setShowLogs(!showLogs)}>
        {showLogs ? (
          <MdOutlineVisibilityOff className='w-6 h-6 text-foreground-1' />
        ) : (
          <MdOutlineVisibility className='w-6 h-6 text-foreground-2' />
        )}
      </ThreadDetailsHeaderButton>
      {showLogs && (
        <Modal
          onClose={() => setShowLogs(false)}
          className='p-5 grid gap-1 max-h-[50vh] overflow-y-auto'
        >
          {logs.map(({ tag, start, isEnded, cost, accumlatedUsages }) => (
            <div
              key={tag}
              className={clsx(
                'bg-background-2 p-2 rounded-xl border border-border-1 transition-all z-50 shadow-xl w-[300px]'
              )}
            >
              <div className='flex gap-2 justify-center font-mono text-xs'>
                <Timer startTime={start} isEnded={isEnded} />
                <span>/</span>
                <span>${cost.toFixed(5)}</span>
                <span>/</span>
                <span>
                  {accumlatedUsages.total_tokens}{' '}
                  <span className='text-foreground-2'>
                    ({accumlatedUsages.cached_tokens})
                  </span>
                </span>
              </div>
            </div>
          ))}
        </Modal>
      )}
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
