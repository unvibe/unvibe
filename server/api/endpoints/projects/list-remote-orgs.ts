import { z } from 'zod';
import { createEndpoint } from '../../create-endpoint';
import { _killScript, _parseProject, PluginsMap } from './utils';

export const listRemoteOrgs = createEndpoint({
  type: 'GET',
  pathname: '/projects/remote/orgs/list',
  params: z.object({}),
  handler: async () => {
    const [result, remoteUsername] = await Promise.all([
      PluginsMap.CorePlugin.Plugin.api.getOrgs(),
      PluginsMap.CorePlugin.Plugin.api.getCurrentUsername(),
    ]);
    if (remoteUsername) {
      result.unshift(remoteUsername);
    }
    return {
      orgs: result,
    };
  },
});
