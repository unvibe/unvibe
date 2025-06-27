import { ThreadDetailsMessageProps } from '../_shared-types';
import { AssistantMessageContextProvider } from './assistant-message-context';
import { ThreadDetailsAssistantMessage } from './thread-details-assistant-message';

export function ThreadDetailsMessageAssistant({
  data,
  threadId,
}: ThreadDetailsMessageProps) {
  return (
    <AssistantMessageContextProvider data={data} threadId={threadId}>
      <ThreadDetailsAssistantMessage />
    </AssistantMessageContextProvider>
  );
}
