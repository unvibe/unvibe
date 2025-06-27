import { useAPIQuery } from '@/server/api/client';
import { ThreadDetailsHeader } from './header';
import { ThreadDetailsMessageList } from './messages/thread-details-message-list';

export function ThreadDetails({ id }: { id: string }) {
  const { data } = useAPIQuery('GET /threads/details', {
    id,
  });

  const thread = data?.thread;

  return (
    <div className='w-full block h-screen'>
      <ThreadDetailsHeader />
      <ThreadDetailsMessageList threadId={id} messages={thread?.messages} />
    </div>
  );
}
