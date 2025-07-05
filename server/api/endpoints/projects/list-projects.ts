import { z } from 'zod';
import { createEndpoint } from '../../create-endpoint';
import { listLocal } from '@/plugins/core/server/api/list-local';

export const listProjects = createEndpoint({
  type: 'GET',
  pathname: '/projects/list',
  params: z.object({
    sources: z.string(),
  }),
  handler: async ({ parsed }) => {
    const { sources } = parsed;

    // from the ~ comma seperated list of directories that are a root of a project
    const projects = await listLocal(sources.split(','));

    return {
      projects,
    };
  },
});
