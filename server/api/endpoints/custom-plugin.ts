import { z } from 'zod';
import { createEndpoint } from '../create-endpoint';
import { db, schema } from '@/server/db';
import { eq, and } from 'drizzle-orm';

// 1. new-system: Fully implemented, supports 'raw' and 'file' types
export const newSystem = createEndpoint({
  type: 'POST',
  pathname: '/custom-plugin/new-system',
  params: z.object({
    projectId: z.string(),
    type: z.enum(['raw', 'file']),
    key: z.string(),
    value: z.string(),
  }),
  handler: async ({ parsed }) => {
    await db.insert(schema.customSystemParts).values({
      id: crypto.randomUUID(),
      project_id: parsed.projectId,
      type: parsed.type,
      key: parsed.key,
      value: parsed.value,
    });
    return { message: 'Custom system part created' };
  },
});

// Remove a custom system part
export const removeSystem = createEndpoint({
  type: 'POST',
  pathname: '/custom-plugin/remove-system',
  params: z.object({
    projectId: z.string(),
    key: z.string(),
  }),
  handler: async ({ parsed }) => {
    await db
      .delete(schema.customSystemParts)
      .where(
        and(
          eq(schema.customSystemParts.project_id, parsed.projectId),
          eq(schema.customSystemParts.key, parsed.key)
        )
      );
    return { message: 'Custom system part removed' };
  },
});

// 2. new-hook: Stub
export const newHook = createEndpoint({
  type: 'POST',
  pathname: '/custom-plugin/new-hook',
  params: z.object({
    projectId: z.string(),
    name: z.string(),
    definition: z.string(),
  }),
  handler: async () => {
    // TODO: Implement DB storage for hooks
    return { message: 'Stub: custom hook creation not yet implemented' };
  },
});

// 3. new-tool: Stub
export const newTool = createEndpoint({
  type: 'POST',
  pathname: '/custom-plugin/new-tool',
  params: z.object({
    projectId: z.string(),
    name: z.string(),
    config: z.string(),
  }),
  handler: async () => {
    // TODO: Implement DB storage for tools
    return { message: 'Stub: custom tool creation not yet implemented' };
  },
});
