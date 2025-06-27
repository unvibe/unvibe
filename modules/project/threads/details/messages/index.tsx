import { ThreadDetailsMessageUser } from './user';
import { ThreadDetailsMessageTool } from './tool';
import { ThreadDetailsMessageAssistant } from './assistant';
import { ThreadDetailsMessageProps } from './_shared-types';

export function ThreadDetailsMessage({
  data,
  threadId,
}: ThreadDetailsMessageProps) {
  if (data.role === 'user') {
    return <ThreadDetailsMessageUser data={data} threadId={threadId} />;
  }

  if (data.role === 'tool') {
    return <ThreadDetailsMessageTool data={data} threadId={threadId} />;
  }

  if (data.role === 'assistant') {
    return <ThreadDetailsMessageAssistant data={data} threadId={threadId} />;
  }

  throw new Error(
    `ThreadDetailsMessage: Unknown role ${data.role} in message ${data.id}`
  );
}
