// Updated endpoint: always includes 'projects' in sources, deduplicated
import { noop } from '@/lib/core/noop';
import { createEndpoint } from '@/server/api/create-endpoint';
import { db } from '@/server/db';
import { sources, sources as sourcesTable } from '@/server/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const DEFAULT_SOURCES = ['projects'];

export const removeSource = createEndpoint({
  type: 'POST',
  pathname: '/home/remove-source',
  params: z.object({
    path: z.string().min(1),
  }),
  handler: async ({ parsed }) => {
    const { path } = parsed;
    try {
      // Delete the source from the database
      await db.delete(sourcesTable).where(eq(sources.path, path));
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  },
});

export const listSources = createEndpoint({
  type: 'GET',
  pathname: '/home/list-sources',
  params: z.object({}), // no params
  handler: async () => {
    let dbSources: string[] = [];
    try {
      dbSources = (await db.select().from(sourcesTable)).map((row) => row.path);
    } catch (error) {
      noop(error);
      console.log('Error fetching sources from database:', error);
    }
    // Always include 'projects', dedupe
    const allSources = Array.from(new Set([...DEFAULT_SOURCES, ...dbSources]));
    return { sources: allSources };
  },
});
