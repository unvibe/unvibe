import { z } from 'zod';
import { PluginsMap } from './utils';
import { createEndpoint } from '../../create-endpoint';

export const listRemote = createEndpoint({
  type: 'GET',
  pathname: '/projects/remote/list',
  params: z.object({}),
  handler: async () => {
    const result = await PluginsMap.CorePlugin.Plugin.api.listRemote();
    return {
      projects: result,
    };
  },
});
