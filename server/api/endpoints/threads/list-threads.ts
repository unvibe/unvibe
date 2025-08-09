import { z } from 'zod';
import { createEndpoint } from '../../create-endpoint';
import { db } from '@/server/db';

export const getThreads = createEndpoint({
  type: 'GET',
  pathname: '/threads/list',
  params: z.object({
    projectId: z.string(),
    type: z.enum(['thread', 'visual']).optional().default('thread'),
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
          and(
            eq(threads.archived, true),
            eq(threads.project_id, projectId),
            eq(threads.type, parsed.type)
          ),
      });

      return { threads };
    }

    const threads = await db.query.threads.findMany({
      orderBy: (fields, { desc }) => desc(fields.created_at),
      where: (threads, { eq, and }) =>
        and(
          eq(threads.archived, false),
          eq(threads.project_id, projectId),
          eq(threads.type, parsed.type)
        ),
    });

    return { threads };
  },
});
