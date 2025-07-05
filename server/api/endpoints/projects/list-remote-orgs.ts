import { z } from 'zod';
import { createEndpoint } from '../../create-endpoint';
import {
  getCurrentUsername,
  getOrgs,
} from '@/plugins/core/server/api/list-remote';

export const listRemoteOrgs = createEndpoint({
  type: 'GET',
  pathname: '/projects/remote/orgs/list',
  params: z.object({}),
  handler: async () => {
    const [result, remoteUsername] = await Promise.all([
      getOrgs(),
      getCurrentUsername(),
    ]);
    if (remoteUsername) {
      result.unshift(remoteUsername);
    }
    return {
      orgs: result,
    };
  },
});
