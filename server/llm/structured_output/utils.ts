// import { Project } from '@/server/project/types';
import {
  AbstractContextAssistantMessage,
  AbstractContextMessage,
} from '@/server/llm/models/_shared-types';

export function shouldBeAstructuredOutput(
  message: AbstractContextMessage
): message is AbstractContextAssistantMessage {
  if (message.role === 'assistant' && typeof message.content === 'string') {
    return true;
  }
  return false;
}
