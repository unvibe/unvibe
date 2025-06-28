import { z } from 'zod';
import { createEndpoint } from '../../create-endpoint';
import { _parseProject, _runScript } from './utils';

export const runScript = createEndpoint({
  type: 'POST',
  pathname: '/projects/run-script',
  params: z.object({
    source: z.string(),
    projectDirname: z.string(),
    command: z.string(),
    args: z.array(z.string()),
  }),
  handler: async ({ parsed }) => {
    const { source, projectDirname, command, args } = parsed;
    const project = await _parseProject(source, projectDirname);
    const processMetadata = await _runScript(project, command, args);
    return {
      processMetadata,
    };
  },
});
