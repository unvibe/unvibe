import { useParams } from '@/lib/next/navigation';
import { Route } from './+types/page';
import {
  prefetchAPIQuery as prefetchAPIQuery_at_browser,
  useAPIMutation,
  useAPIQuery,
} from '@/server/api/client';
import { prefetchAPIQuery as prefetchAPIQuery_at_server } from '@/server/api/client/index.server';
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query';
import { useCallback } from 'react';
import { ThreadDetailsMessage } from '~/modules/project/threads/details/messages';
import { StartThreadInput } from '~/modules/project/threads/llm-input';

export async function loader({ params }: Route.LoaderArgs) {
  const id = params.id;
  const queryClient = new QueryClient();
  await prefetchAPIQuery_at_server('GET /threads/details', queryClient, {
    id,
  });
  return {
    dehydratedState: dehydrate(queryClient),
  };
}

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const id = params.id;
  const queryClient = new QueryClient();
  await prefetchAPIQuery_at_browser('GET /threads/details', queryClient, {
    id,
  });
  return {
    dehydratedState: dehydrate(queryClient),
  };
}

function Content({ id }: { id: string }) {
  const { data } = useAPIQuery('GET /threads/details', {
    id,
  });
  const { mutate: continueThread, isPending } = useAPIMutation(
    'POST /visual-mode-threads/continue'
  );

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
  const projectId = useParams().project_id as string;
  return (
    <div className='w-full block h-screen' ref={scrollToBottom}>
      <div className='grid gap-2 py-2 pb-42 h-[calc(100vh-var(--header-height)-var(--footer-height))] overflow-y-auto content-start relative'>
        {data?.thread?.messages?.map((message) => (
          <ThreadDetailsMessage key={message.id} data={message} />
        ))}
      </div>
      <div className='sticky bottom-0 inset-x-8 z-50 p-2'>
        <StartThreadInput
          isPending={isPending}
          onSubmit={(value) => {
            continueThread({
              threadId: id,
              projectId,
              prompt: value.prompt,
              context_config: value.contextConfig,
              images: [],
            });
          }}
          placeholder='Describe the change you want to make to this screen...'
        />
      </div>
    </div>
  );
}

export default function Page({ params, loaderData }: Route.ComponentProps) {
  const { dehydratedState } = loaderData;
  const id = params.id;

  return (
    <HydrationBoundary state={dehydratedState}>
      <div className='w-full h-full max-h-screen max-w-full relative pb-[120px]'>
        <div className='max-w-5xl mx-auto w-full h-full'>
          <Content id={id} />
        </div>
      </div>
    </HydrationBoundary>
  );
}
