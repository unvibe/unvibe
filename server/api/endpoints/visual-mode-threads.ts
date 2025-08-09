import { createEndpoint } from '../create-endpoint';
import { z } from 'zod';
import { db, schema } from '@/server/db';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { parseProject } from '@/server/project/parse';
import { Context } from '@/server/llm';
import * as llm from '@/server/llm';
import { models } from '@/server/llm/models';
import {
  allPlugins,
  createThread,
  generateThreadTitle,
  getModelById,
  sendEventEnd,
  sendEventStart,
} from './threads/utils';
import { Message, StructuredOutputMetadata, Thread } from '@/server/db/schema';
import { createMetadata } from './threads/continue-utils';

// Shared helpers (trimmed/adapted from threads/continue.ts)
async function saveThread(
  thread: Thread,
  threadMessages: Message[],
  threadId: string,
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
      if (message.content === metadata?.raw) {
        message.metadata = metadata ?? null;
      }
      return db.insert(schema.messages).values(message);
    })
  );
}

function extractNewMessagesForPersist(context: Context, startLength: number) {
  const history = context.collectMessages();
  const endLength = history.length;
  const newMessagesCount = endLength - startLength;
  const normalized = history[0]?.role === 'system' ? history.slice(1) : history;
  // include the triggering user message followed by assistant/tool messages
  const contextMessagesToStore = normalized.slice(-(newMessagesCount + 1));
  return contextMessagesToStore;
}

// Create + first-turn in one call for Visual Mode
const paramsCreate = z.object({
  projectId: z.string(),
  prompt: z.string(),
  model_id: z.string().optional(),
  context_config: z.record(z.string(), z.boolean()).optional(),
  images: z.array(z.string()).optional(),
  search_enabled: z.boolean().optional(),
});

export const visualModeThreads = createEndpoint({
  type: 'POST',
  pathname: '/visual-mode-threads',
  params: paramsCreate,
  handler: async ({ parsed }: { parsed: z.infer<typeof paramsCreate> }) => {
    const {
      projectId,
      prompt,
      model_id,
      context_config,
      images,
      search_enabled = false,
    } = parsed;

    const id = randomUUID();

    // 1) Create a new thread with a Visual-mode flavored title
    const title = await generateThreadTitle(prompt).catch(() => 'Untitled');
    const modelId = model_id ?? models.ChatGPT4_1Mini.MODEL_CONFIG.id;

    const newThread = createThread({
      id,
      type: 'visual',
      projectId,
      modelId,
      title: `Visual: ${title || 'Untitled'}`,
      workspaces: [],
      context_config: context_config || {},
    });

    await db.insert(schema.threads).values(newThread);

    // 2) Build context and run first LLM turn
    const tag = randomUUID();
    sendEventStart(tag, id);

    const project = await parseProject(projectId, allPlugins);
    const context = new Context();
    const model = getModelById(newThread.model_id);

    await context.fromProjectConfig(
      project,
      context_config || newThread.context_config || {}
    );

    // First user message
    context.append.user({
      content: {
        text: prompt,
        images_urls: images || [],
      },
    });

    const startLength = context.collectMessages().length;

    const result = await llm.send({
      model,
      structuredOutput: true,
      context,
      tag,
      search_enabled,
    });

    // 3) Create structured output metadata and collect messages to store
    const { partialMetadata } = await createMetadata(result.response, project);
    const contextMessagesToStore = extractNewMessagesForPersist(
      context,
      startLength
    );

    const threadMessages = await Promise.all(
      context.toThreadMessages(contextMessagesToStore, async (m) => m.content, {
        id,
      })
    );

    await saveThread(
      newThread,
      threadMessages,
      id,
      partialMetadata,
      context_config
    );

    sendEventEnd(tag, id);

    return {
      id,
      message: 'Visual thread created and first turn completed',
      thread: newThread,
    };
  },
});

// Continue a Visual Mode thread (mirrors POST /threads/continue)
const paramsContinue = z.object({
  prompt: z.string(),
  threadId: z.string(),
  projectId: z.string(),
  images: z.array(z.string()).optional(),
  search_enabled: z.boolean().optional(),
  context_config: z.record(z.string(), z.boolean()).optional(),
});

export const visualModeThreadsContinue = createEndpoint({
  type: 'POST',
  pathname: '/visual-mode-threads/continue',
  params: paramsContinue,
  handler: async ({
    parsed: {
      prompt,
      threadId,
      projectId,
      images,
      search_enabled = false,
      context_config,
    },
  }: {
    parsed: z.infer<typeof paramsContinue>;
  }) => {
    const tag = randomUUID();
    sendEventStart(tag, threadId);

    // Load current thread and messages
    const thread = await db.query.threads.findFirst({
      where: (threads, { eq }) => eq(threads.id, threadId),
    });
    if (!thread) throw new Error('Thread not found');

    const messages = await db.query.messages.findMany({
      where: (messages, { eq }) => eq(messages.thread_id, threadId),
      orderBy(fields, operators) {
        return operators.asc(fields.index);
      },
    });

    const project = await parseProject(projectId, allPlugins);

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

    const startLength = context.collectMessages().length;

    const result = await llm.send({
      model,
      structuredOutput: true,
      context,
      tag,
      search_enabled,
    });

    const { partialMetadata } = await createMetadata(result.response, project);
    const contextMessagesToStore = extractNewMessagesForPersist(
      context,
      startLength
    );

    const threadMessages = await Promise.all(
      context.toThreadMessages(contextMessagesToStore, async (m) => m.content, {
        id: threadId,
      })
    );

    await saveThread(
      thread,
      threadMessages,
      threadId,
      partialMetadata,
      context_config
    );

    sendEventEnd(tag, threadId);

    return { thread };
  },
});
