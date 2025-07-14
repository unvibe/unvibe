import type { Message } from '@/server/db/schema';
import { ThreadDetailsMessage } from '.';
import { CSSProperties, useCallback } from 'react';
import { ContinueThreadInput } from './continue-thread-input';
import { HEADER_HEIGHT } from '../header';
import { useBackedLogStore } from '../../use-backed-log-store';
import { useAPIQuery } from '@/server/api/client';
import Timer from '@/lib/ui/timer';
import clsx from 'clsx';

const FOOTER_HEIGHT = 0;

export function ThreadDetailsMessageList({
  messages,
  threadId,
  agentId,
}: {
  messages?: Message[];
  threadId: string;
  agentId?: string;
}) {
  const tagged = useBackedLogStore((state) => state.tagged);
  const format = useBackedLogStore((state) => state.format);
  const { data } = useAPIQuery('GET /models');
  console.log(tagged);
  const logs = format(data?.models ?? [], tagged, threadId);

  const scrollToBottom = useCallback((node: null | HTMLElement) => {
    if (!node) return;

    let timer = 0;

    node.scrollTop = node.scrollHeight;

    const observer = new MutationObserver((records) => {
      const isAdded = records.some((record) => {
        return (
          record.type === 'childList' &&
          record.addedNodes.length > 0 &&
          record.target === node
        );
      });

      if (isAdded) {
        node.scrollTop = node.scrollHeight;
        timer = window.setTimeout(() => {
          node.scrollTop = node.scrollHeight;
        });
      }
    });

    observer.observe(node, { childList: true });

    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, []);

  const hasLogs = logs.some((log) => !log.isEnded);

  return (
    <div className='relative' id='thread-details-message-list'>
      <div
        style={
          {
            '--header-height': `${HEADER_HEIGHT}px`,
            '--footer-height': `${FOOTER_HEIGHT}px`,
          } as CSSProperties
        }
        className='grid gap-2 py-2 pb-42 h-[calc(100vh-var(--header-height)-var(--footer-height))] overflow-y-auto content-start relative'
        ref={scrollToBottom}
      >
        {messages?.map((t) => (
          <ThreadDetailsMessage
            key={t.id}
            data={t}
            threadId={threadId}
            agentId={agentId}
          />
        ))}
      </div>
      <div className='relative'>
        <div className='mx-auto h-32 bg-gradient-to-t from-background to-transparent absolute bottom-0 inset-x-0 z-50' />
      </div>
      <div className='relative'>
        <div className='bottom-10 inset-x-0 w-full px-8 max-w-3xl mx-auto absolute z-50'>
          {hasLogs && (
            <div className='mx-auto max-w-[300px] flex-col flex items-center justify-center gap-1 overflow-y-scroll p-1 pb-5'>
              {logs.map(
                ({ tag, start, isEnded, cost, accumlatedUsages, opacity }) => (
                  <div
                    key={tag}
                    className={clsx(
                      `bg-background-2 p-2 rounded-xl border border-border-1 transition-all z-50 shadow-xl w-[300px] brightness-[${opacity}]`,
                      isEnded ? 'hidden' : 'block'
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
                )
              )}
            </div>
          )}
          <ContinueThreadInput></ContinueThreadInput>
        </div>
      </div>
    </div>
  );
}
