import { createEndpoint } from '../../create-endpoint';
import { z } from 'zod';
import { db, schema } from '@/server/db';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { parseProject } from '@/plugins/core/server/api';
import { Context } from '@/server/llm';
import * as llm from '@/server/llm';
import {
  formatStructuredOutputFiles,
  shouldBeAstructuredOutput,
} from '@/server/llm/structured_output/utils';
import { sha1 } from '@/lib/core/hash/sha1';
import { jsonrepair } from 'jsonrepair';
import { normalizePath, runProposalDiagnostics } from '../projects/utils';
import {
  allPlugins,
  getModelById,
  getThreadById,
  sendEventEnd,
  sendEventStart,
} from './utils';
import { Message, StructuredOutputMetadata, Thread } from '@/server/db/schema';
import { Project } from '@/plugins/core/server/api/lib/project';
import { ModelResponseStructure } from '@/server/llm/structured_output';

async function loadThreadAndMessages(threadId: string) {
  const [thread, messages] = await Promise.all([
    await getThreadById(threadId),
    await db.query.messages.findMany({
      where: (messages, { eq }) => eq(messages.thread_id, threadId),
      orderBy(fields, operators) {
        return operators.asc(fields.index);
      },
    }),
  ]);

  if (!thread) {
    throw new Error('Thread not found');
  }

  return { thread, messages };
}

async function loadContext(
  projectId: string,
  thread: Thread,
  messages: Message[],
  context_config: Record<string, boolean> | undefined,
  prompt: string,
  images: string[] | undefined
) {
  const project = await parseProject('projects', projectId, allPlugins);
  // 4. prepare the context
  const context = new Context();
  const model = getModelById(thread.model_id);
  await context.fromProjectConfig(
    project,
    context_config || thread.context_config || {}
  );
  context.append.fromThreadMessages(messages);
  context.append.user({
    content: {
      text: prompt,
      images_urls: images || [],
    },
  });

  return { context, model, project };
}

async function createMetadata(
  response: string | null | undefined,
  project: Project
) {
  if (!response) return {};
  const hash = await sha1(response);
  const repaired = jsonrepair(response);
  const formatted = await formatStructuredOutputFiles(project, repaired);
  const parsed: ModelResponseStructure = JSON.parse(formatted);
  const diagnostics = await runProposalDiagnostics(parsed, project);

  const replacedPaths = parsed.replace_files?.map((p) => p.path) || [];
  const deletedPaths = parsed.delete_files?.map((p) => p.path) || [];
  const editedPaths = parsed.edit_files?.map((p) => p.path) || [];
  const relatedFiles = replacedPaths.concat(deletedPaths).concat(editedPaths);
  const sha1Map = Object.fromEntries(
    await Promise.all(
      relatedFiles.map(async (filePath) => {
        const content =
          project.EXPENSIVE_REFACTOR_LATER_content[normalizePath(filePath)] ||
          '';
        return [filePath, await sha1(content)];
      })
    )
  );

  const resolvedEditedFiles = parsed.edit_files?.map((file) => {
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

  const partialMetadata: StructuredOutputMetadata = {
    raw: response,
    diagnostics: Object.fromEntries(
      diagnostics.map((hook) => {
        return [hook.name, JSON.parse(hook.result)];
      })
    ),
    parsed,
    source_sha1: sha1Map,
    resolved_edited_files: resolvedEditedFiles,
  };

  return {
    hash,
    partialMetadata,
  };
}

async function runLLM(
  context: Context,
  model: llm.Model,
  tag: string,
  search_enabled: boolean
) {
  const startLength = context.collectMessages().length;
  const result = await llm.send({
    model,
    structuredOutput: true,
    context,
    tag,
    search_enabled,
  });

  return { result, startLength };
}

async function extractNewMessages(
  context: Context,
  project: Project,
  threadId: string,
  startLength: number,
  partialMetadata?: Omit<StructuredOutputMetadata, 'messageId'>,
  hash?: string
) {
  const history = context.collectMessages();
  const endLength = history.length;
  const newMessagesCount = endLength - startLength;
  const normalized = history[0].role === 'system' ? history.slice(1) : history;
  const contextMessagesToStore = normalized.slice(-(newMessagesCount + 1)); // +1 for the user message

  let newHash: string | undefined;
  // transform the output (transform-hooks)
  const threadMessages = await Promise.all(
    context.toThreadMessages(
      contextMessagesToStore,
      async (message) => {
        if (shouldBeAstructuredOutput(message)) {
          const replaceHash = await sha1(message.content);
          const formatted = await formatStructuredOutputFiles(
            project,
            message.content
          );
          if (hash === replaceHash && partialMetadata) {
            newHash = formatted;
          }
          return formatted;
        }
        return message.content;
      },
      { id: threadId }
    )
  );

  return { threadMessages, newHash };
}

async function saveThread(
  thread: Thread,
  threadMessages: Message[],
  threadId: string,
  metadataInsertHash?: string,
  metadata?: StructuredOutputMetadata,
  context_config?: Record<string, boolean>
) {
  await db
    .update(schema.threads)
    .set({
      updated_at: Date.now(),
      context_config: context_config || thread.context_config,
    })
    .where(eq(schema.threads.id, threadId));

  await Promise.all(
    threadMessages.map((message) => {
      if (message.content === metadataInsertHash) {
        message.metadata = metadata ?? null;
      }

      return db.insert(schema.messages).values(message);
    })
  );
}

export const continueThread = createEndpoint({
  type: 'POST',
  pathname: '/threads/continue',
  params: z.object({
    prompt: z.string(),
    threadId: z.string(),
    projectId: z.string(),
    images: z.array(z.string()).optional(),
    search_enabled: z.boolean().optional(),
    context_config: z.record(z.string(), z.boolean()).optional(),
  }),
  handler: async ({
    parsed: {
      prompt,
      threadId,
      projectId,
      images,
      search_enabled = false,
      context_config,
    },
  }) => {
    // 1. mark the start of the task
    const tag = randomUUID();
    sendEventStart(tag, threadId);

    // 2. load the thread and messages
    const { messages, thread } = await loadThreadAndMessages(threadId);
    const { context, project, model } = await loadContext(
      projectId,
      thread,
      messages,
      context_config,
      prompt,
      images
    );
    // 3. run the LLM
    const { result, startLength } = await runLLM(
      context,
      model,
      tag,
      search_enabled
    );
    // 4. create metadata from the response
    const { hash, partialMetadata } = await createMetadata(
      result.response,
      project
    );

    // 5. collect new messages generated by the llm from the context
    const { threadMessages, newHash } = await extractNewMessages(
      context,
      project,
      threadId,
      startLength,
      partialMetadata,
      hash
    );

    // 6. save everything to the database
    await saveThread(
      thread,
      threadMessages,
      threadId,
      newHash,
      partialMetadata,
      context_config
    );

    sendEventEnd(tag, threadId);

    return {
      thread,
    };
  },
});
