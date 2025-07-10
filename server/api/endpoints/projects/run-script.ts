import { z } from 'zod';
import { createEndpoint } from '../../create-endpoint';
import { _parseProject, _runScript } from './utils';

export const runScript = createEndpoint({
  type: 'POST',
  pathname: '/projects/run-script',
  params: z.object({
    id: z.string(), // project id
    command: z.string(),
    args: z.array(z.string()),
  }),
  handler: async ({ parsed }) => {
    const { id, command, args } = parsed;
    const project = await _parseProject(id);
    const processMetadata = await _runScript(project, command, args);
    return {
      processMetadata,
    };
  },
});
