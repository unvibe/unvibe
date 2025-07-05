import { z } from 'zod';
import { createEndpoint } from '../../create-endpoint';
import { listRemote as _listRemote } from '@/plugins/core/server/api/list-remote';

export const listRemote = createEndpoint({
  type: 'GET',
  pathname: '/projects/remote/list',
  params: z.object({}),
  handler: async () => {
    const result = await _listRemote();
    return {
      projects: result,
    };
  },
});
