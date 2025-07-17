import { ThreadDetailsMessageUser } from './user';
import { ThreadDetailsMessageTool } from './tool';
import { ThreadDetailsMessageAssistant } from './assistant';
import { ThreadDetailsMessageProps } from './_shared-types';

export function ThreadDetailsMessage({ data }: ThreadDetailsMessageProps) {
  if (data.role === 'user') {
    return <ThreadDetailsMessageUser data={data} />;
  }

  if (data.role === 'tool') {
    return <ThreadDetailsMessageTool data={data} />;
  }

  if (data.role === 'assistant') {
    return <ThreadDetailsMessageAssistant data={data} />;
  }

  throw new Error(
    `ThreadDetailsMessage: Unknown role ${data.role} in message ${data.id}`
  );
}
