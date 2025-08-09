import { useAPIQuery } from '@/server/api/client';
import { ThreadDetailsHeader } from './header';
import { ThreadDetailsMessageList } from './messages/thread-details-message-list';

export function ThreadDetails({
  id,
  withInput = true,
}: {
  id: string;
  withInput?: boolean;
}) {
  const { data } = useAPIQuery('GET /threads/details', {
    id,
  });

  const thread = data?.thread;

  return (
    <div className='w-full block h-screen'>
      <ThreadDetailsHeader />
      <ThreadDetailsMessageList
        threadId={id}
        messages={thread?.messages}
        withInput={withInput}
      />
    </div>
  );
}
