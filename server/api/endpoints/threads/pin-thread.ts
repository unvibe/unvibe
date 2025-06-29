import { z } from 'zod';
import { createEndpoint } from '../../create-endpoint';
import { db, schema } from '@/server/db';
import { eq } from 'drizzle-orm';

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
