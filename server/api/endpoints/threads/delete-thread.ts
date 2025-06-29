import { z } from 'zod';
import { createEndpoint } from '../../create-endpoint';
import { db, schema } from '@/server/db';
import { eq } from 'drizzle-orm';

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
