import { z } from 'zod';
import { _modifyFiles } from './utils';
import { createEndpoint } from '../../create-endpoint';

export const modifyFiles = createEndpoint({
  type: 'POST',
  pathname: '/projects/modify-files',
  params: z.object({
    projectId: z.string(),
    entries: z.array(
      z.object({
        path: z.string(),
        content: z.string().optional(),
        operation: z.enum(['write', 'delete']),
      })
    ),
  }),
  handler: async ({ parsed }) => {
    const { projectId, entries } = parsed;
    try {
      await _modifyFiles(entries, projectId);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  },
});
