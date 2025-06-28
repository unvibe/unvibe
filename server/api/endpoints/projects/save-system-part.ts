import { z } from 'zod';
import { createEndpoint } from '../../create-endpoint';
import { db, schema } from '@/server/db';

export const saveSystemPart = createEndpoint({
  type: 'POST',
  pathname: '/projects/save-system-part',
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

    return {
      message: 'System part saved successfully',
    };
  },
});
