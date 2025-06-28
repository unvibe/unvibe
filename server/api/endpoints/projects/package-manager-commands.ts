import { z } from 'zod';
import { _packageManagerCommands } from './utils';
import { createEndpoint } from '../../create-endpoint';

export const packageManagerCommands = createEndpoint({
  type: 'POST',
  pathname: '/projects/package-manager-commands',
  params: z.object({
    projectId: z.string(),
    packages: z.object({
      install: z.array(z.string()),
      uninstall: z.array(z.string()),
    }),
  }),
  handler: async ({ parsed }) => {
    const { projectId, packages } = parsed;
    return {
      message: await _packageManagerCommands(packages, projectId),
    };
  },
});
