import { createEndpoint } from '../../create-endpoint';
import { z } from 'zod';
import { db, schema } from '@/server/db';
import { createThread, generateThreadTitle } from './utils';

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
