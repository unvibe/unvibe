import { z } from 'zod';
import { createEndpoint } from '../../create-endpoint';
import { resolveHomePath } from '@/server/project/utils';
import fs from 'node:fs/promises';
import path from 'node:path';

export const requestFile = createEndpoint({
  type: 'GET',
  pathname: '/projects/request-file',
  params: z.object({
    projectId: z.string(),
    filePath: z.string(),
  }),
  handler: async ({ parsed }) => {
    const { projectId, filePath } = parsed;
    const fileAbsolutePath = resolveHomePath(
      path.join(`projects/${projectId}`, filePath)
    );
    try {
      const content = await fs.readFile(fileAbsolutePath, 'utf-8');
      return {
        content,
        filePath: path.basename(filePath),
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : String(error),
      };
    }
  },
});
