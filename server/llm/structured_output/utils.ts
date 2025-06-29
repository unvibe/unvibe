import { Project } from '@/plugins/core/server/api/lib/project';
import {
  AbstractContextAssistantMessage,
  AbstractContextMessage,
} from '@/server/llm/models/_shared-types';
import { ModelResponseStructure } from '../structured_output';
import { runTransforms } from './transform';

export async function formatStructuredOutputFiles(
  project: Project,
  message: string
) {
  try {
    const json: ModelResponseStructure = JSON.parse(message);
    if (json?.replace_files) {
      const newDraft = await runTransforms(project, json?.replace_files);
      const newJSON = { ...json };
      newJSON.replace_files = newDraft;
      return JSON.stringify(newJSON);
    }
    return message;
  } catch {
    return message;
  }
}

export function shouldBeAstructuredOutput(
  message: AbstractContextMessage
): message is AbstractContextAssistantMessage {
  if (message.role === 'assistant' && typeof message.content === 'string') {
    return true;
  }
  return false;
}
