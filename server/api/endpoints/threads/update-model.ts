import { z } from 'zod';
import { createEndpoint } from '../../create-endpoint';
import { db, schema } from '@/server/db';
import { eq } from 'drizzle-orm';

export const updateThreadModel = createEndpoint({
  type: 'POST',
  pathname: '/threads/update-model',
  params: z.object({
    id: z.string(),
    model_id: z.string(),
  }),
  handler: async ({ parsed }) => {
    const { id, model_id } = parsed;
    await db
      .update(schema.threads)
      .set({ model_id })
      .where(eq(schema.threads.id, id));

    return {
      success: true,
      message: 'Thread model updated successfully',
    };
  },
});
