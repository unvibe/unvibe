import { ThreadDetails } from '@/modules/project/threads/details';
import { ThreadDetailsHeaderActions } from '@/modules/project/threads/details/header';
import { Route } from './+types/page';
import { prefetchAPIQuery as prefetchAPIQuery_at_browser } from '@/server/api/client';
import { prefetchAPIQuery as prefetchAPIQuery_at_server } from '@/server/api/client/index.server';
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query';

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

export default function Page({ params, loaderData }: Route.ComponentProps) {
  const { dehydratedState } = loaderData;
  const id = params.id;
  return (
    <HydrationBoundary state={dehydratedState}>
      <div className='w-full h-full max-h-screen overflow-hidden max-w-full relative'>
        <div className='max-w-5xl mx-auto w-full h-full overflow-hidden'>
          <ThreadDetails id={id} />
        </div>
        <div className='absolute inset-y-0 right-0 p-8 z-50'>
          <ThreadDetailsHeaderActions id={id} />
        </div>
      </div>
    </HydrationBoundary>
  );
}
