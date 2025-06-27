import { createEndpoint } from '../create-endpoint';
import { z } from 'zod';
import { db, schema } from '@/server/db';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { sendWebsocketEvent } from '@/server/websocket/server';
import { parseProject } from '@/plugins/core/server/api';
import * as PluginsMap from '@/plugins/plugins.server';
import { Context } from '@/server/llm';
import * as llm from '@/server/llm';
import { Thread } from '@/server/db/schema';
import {
  formatStructuredOutputFiles,
  shouldBeAstructuredOutput,
} from '@/server/llm/structured_output/utils';
import { models } from '@/server/llm/models';

async function generateThreadTitle(prompt: string) {
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

function getModelById(modelId: string) {
  const model = Object.values(models).filter(
    (model) => model.MODEL_CONFIG.id === modelId
  )[0];
  if (!model) {
    throw new Error(`Model with id ${modelId} not found`);
  }
  return model;
}

const allPlugins = Object.values(PluginsMap).map((plugin) => plugin.Plugin);

async function getThreadById(id: string) {
  const thread = await db.query.threads.findFirst({
    where: (threads, { eq }) => eq(threads.id, id),
  });
  return thread || null;
}

export const getThreads = createEndpoint({
  type: 'GET',
  pathname: '/threads/list',
  params: z.object({
    projectId: z.string(),
    archived: z
      .string()
      .transform((v) => v === 'true')
      .optional(),
  }),
  handler: async ({ parsed }) => {
    const { projectId, archived } = parsed;

    if (archived) {
      const threads = await db.query.threads.findMany({
        orderBy: (fields, { desc }) => desc(fields.created_at),
        where: (threads, { eq, and }) =>
          and(eq(threads.archived, true), eq(threads.project_id, projectId)),
      });

      return { threads };
    }

    const threads = await db.query.threads.findMany({
      orderBy: (fields, { desc }) => desc(fields.created_at),
      where: (threads, { eq, and }) =>
        and(eq(threads.archived, false), eq(threads.project_id, projectId)),
    });

    return { threads };
  },
});

export const getThreadDetails = createEndpoint({
  type: 'GET',
  pathname: '/threads/details',
  params: z.object({
    id: z.string(),
  }),
  handler: async ({ parsed }) => {
    const { id } = parsed;

    const thread = await db.query.threads.findFirst({
      where: (threads, { eq }) => eq(threads.id, id),
    });

    if (!thread) {
      return {
        thread: null,
        status: false,
        error: 'Thread not found',
      };
    }

    const messages = await db.query.messages.findMany({
      where: (messages, { eq }) => eq(messages.thread_id, id),
      orderBy(fields, operators) {
        return operators.asc(fields.index);
      },
    });

    return {
      status: true,
      error: null,
      thread: {
        ...thread,
        messages,
      },
    };
  },
});

export const pinThread = createEndpoint({
  type: 'POST',
  pathname: '/threads/pin',
  params: z.object({
    id: z.string(),
    pinned: z.boolean(),
  }),
  handler: async ({ parsed }) => {
    const { id, pinned } = parsed;
    await db
      .update(schema.threads)
      .set({ pinned })
      .where(eq(schema.threads.id, id));
    return {
      success: true,
      message: `Thread ${pinned ? 'pinned' : 'unpinned'} successfully`,
    };
  },
});

export const deleteThread = createEndpoint({
  type: 'POST',
  pathname: '/threads/delete',
  params: z.object({
    id: z.string(),
  }),
  handler: async ({ parsed }) => {
    const { id } = parsed;
    await db
      .update(schema.threads)
      .set({ archived: true })
      .where(eq(schema.threads.id, id));
    return {
      success: true,
      message: 'Thread deleted successfully',
    };
  },
});

function createThread({
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

export const createThreadOnly = createEndpoint({
  type: 'POST',
  pathname: '/threads/create',
  params: z.object({
    id: z.string(),
    model_id: z.string(),
    context_config: z.record(z.string(), z.boolean()),
    projectId: z.string(),
    prompt: z.string(),
  }),
  handler: async ({ parsed }) => {
    const { id, model_id, context_config, projectId, prompt } = parsed;
    const title = await generateThreadTitle(prompt);
    const newThread = createThread({
      id,
      projectId,
      modelId: model_id,
      title: title || 'untitled',
      workspaces: [],
      context_config: context_config,
    });
    await db.insert(schema.threads).values(newThread);
    return {
      id: newThread.id,
      message: 'Thread created successfully',
    };
  },
});

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
  handler: async ({ parsed }) => {
    const {
      prompt,
      threadId,
      projectId,
      images,
      search_enabled = false,
      context_config,
    } = parsed;
    // 1. mark the start of the task
    const tag = randomUUID();
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

    // 2. get the thread and all previous messages
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

    // 3. parse the project
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
    const startLength = context.collectMessages().length;

    // 5. get the model response (mutate the context)
    await llm.send({
      model,
      structuredOutput: true,
      context,
      tag,
      search_enabled,
    });

    // 6. update the thread's updated_at timestamp
    await db
      .update(schema.threads)
      .set({
        updated_at: Date.now(),
        context_config: context_config || thread.context_config,
      })
      .where(eq(schema.threads.id, threadId));

    // 7. collect the messages from the context
    const history = context.collectMessages();
    const endLength = history.length;
    const newMessagesCount = endLength - startLength;
    const normalized =
      history[0].role === 'system' ? history.slice(1) : history;
    const contextMessagesToStore = normalized.slice(-(newMessagesCount + 1)); // +1 for the user message

    // transform the output (transform-hooks)
    const threadMessages = await Promise.all(
      context.toThreadMessages(
        contextMessagesToStore,
        async (message) => {
          if (shouldBeAstructuredOutput(message)) {
            return await formatStructuredOutputFiles(project, message.content);
          }
          return message.content;
        },
        { id: threadId }
      )
    );

    // 8. insert the messages into the database
    await Promise.all(
      threadMessages.map((message) => {
        return db.insert(schema.messages).values(message);
      })
    );

    // 9. mark the end of the task
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
    return {
      thread,
    };
  },
});
