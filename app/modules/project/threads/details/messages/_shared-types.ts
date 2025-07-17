import type { Message } from '@/server/db/schema';

export interface ThreadDetailsMessageProps {
  data: Message;
  agentId?: string;
}
