import type { Message } from '@/server/db/schema';

export interface ThreadDetailsMessageProps {
  data: Message;
  threadId: string;
  agentId?: string;
}
