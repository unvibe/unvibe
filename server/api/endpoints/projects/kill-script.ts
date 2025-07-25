import { z } from 'zod';
import { createEndpoint } from '../../create-endpoint';
import { _killScript, _parseProject } from './utils';

export const killScript = createEndpoint({
  type: 'POST',
  pathname: '/projects/kill-script',
  params: z.object({
    projectId: z.string(),
    processMetadata: z.object({
      id: z.string(),
      pid: z.number(),
      state: z.enum(['running', 'stopped']),
      command: z.string(),
      args: z.array(z.string()),
      exitCode: z.number().optional(),
      stdout: z.string(),
      stderr: z.string(),
      cwd: z.string(),
    }),
  }),
  handler: async ({ parsed }) => {
    const { projectId, processMetadata } = parsed;
    const project = await _parseProject(projectId);

    const result = _killScript(project, processMetadata);

    return {
      processMetadata: result,
    };
  },
});
