import { createEndpoint } from '@/server/api/create-endpoint';
import { z } from 'zod';
import { db } from '@/server/db';
import { sources } from '@/server/db/schema';

export const addSource = createEndpoint({
  type: 'POST',
  pathname: '/home/add-source',
  params: z.object({
    path: z.string().min(1),
  }),
  handler: async ({ parsed }) => {
    const { path } = parsed;
    try {
      // Upsert-like behavior: ignore if already exists
      await db.insert(sources).values({ path }).onConflictDoNothing();
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  },
});
