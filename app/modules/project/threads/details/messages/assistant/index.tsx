import type { Message } from '@/server/db/schema';
import { AssistantMessage } from '@/server/llm/structured_output/component';

export function ThreadDetailsMessageAssistant({ data }: { data: Message }) {
  return <AssistantMessage message={data} />;
}
