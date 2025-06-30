import { db } from '@/server/db';
import * as PluginsMap from '@/plugins/plugins.server';
import * as llm from '@/server/llm';
import { models } from '@/server/llm/models';
import { Thread } from '@/server/db/schema';
import { sendWebsocketEvent } from '@/server/websocket/server';
import { ModelResponseStructure } from '@/server/llm/structured_output';
import { Project } from '@/plugins/core/server/api/lib/project';
import { normalizePath } from '../projects/utils';
import { applyRangeEdits } from '@/server/llm/structured_output/resolve-edits';

export function sendEventEnd(tag: string, threadId: string) {
  sendWebsocketEvent({
    ts: Date.now(),
    id: 'threads',
    type: 'json',
    content: {
      id: threadId,
      tag,
      type: 'end',
    },
  });
}

export function sendEventStart(tag: string, threadId: string) {
  sendWebsocketEvent({
    ts: Date.now(),
    id: 'threads',
    type: 'json',
    content: {
      tag,
      id: threadId,
      type: 'start',
    },
  });
}

export async function generateThreadTitle(prompt: string) {
  const DEFAULT_TITLE = 'Untitled Thread';
  const context = new llm.Context();

  context.append.system({
    content:
      'You are a thread title generator, based on the user prompt generate a short title for the thread that the user can glance at and understand what the thread is about, keep your response as plain text without any formatting or extra information. no extra information, follow up questions are not allowd, just the title. make the title has a bit of sense of humor, but not too much. make it short and concise.',
  });
  context.append.user({
    content: { text: `user prompt "${prompt}"` },
  });

  try {
    const { response: newTitle } = await llm.send({
      model: models.ChatGPT4_1Mini,
      context,
    });
    return newTitle || DEFAULT_TITLE;
  } catch (error) {
    console.log('Error generating thread title:', error);
    return 'Untitled Thread';
  }
}

export function getModelById(modelId: string) {
  const model = Object.values(models).filter(
    (model) => model.MODEL_CONFIG.id === modelId
  )[0];
  if (!model) {
    throw new Error(`Model with id ${modelId} not found`);
  }
  return model;
}

export const allPlugins = Object.values(PluginsMap).map(
  (plugin) => plugin.Plugin
);

export async function getThreadById(id: string) {
  const thread = await db.query.threads.findFirst({
    where: (threads, { eq }) => eq(threads.id, id),
  });
  return thread || null;
}

export function createThread({
  id,
  projectId,
  modelId,
  title,
  workspaces,
  context_config = {},
}: {
  id: string;
  projectId: string;
  modelId: string;
  title: string;
  workspaces: string[];
  context_config: Record<string, boolean>;
}): Thread {
  return {
    id,
    project_id: projectId,
    model_id: modelId,
    created_at: Date.now(),
    pinned: false,
    title,
    updated_at: Date.now(),
    archived: false,
    workspaces: workspaces,
    context_config: context_config,
  };
}

export function resolveRangeEdits(
  edits: ModelResponseStructure['edit_ranges'] = [],
  project: Project
) {
  return edits?.map((range) => {
    const source =
      project.EXPENSIVE_REFACTOR_LATER_content[normalizePath(range.path)] || '';
    const newSource = applyRangeEdits(source, range.edits);
    return {
      path: range.path,
      content: newSource,
    };
  });
}

export function resolveEdits(
  edits: ModelResponseStructure['edit_files'] = [],
  project: Project
) {
  return edits?.map((file) => {
    const source =
      project.EXPENSIVE_REFACTOR_LATER_content[normalizePath(file.path)] || '';
    // todo apply the range to the source
    // Apply the edit by lines
    const sourceLines = source.split('\n');
    const editLines = file.content.split('\n');
    // split the source lines in two parts
    const newLines = [...sourceLines];
    newLines.splice(file.insert_at - 1, 0, ...editLines);
    const appliedContent = newLines.join('\n');
    return {
      path: file.path,
      content: appliedContent,
    };
  });
}
