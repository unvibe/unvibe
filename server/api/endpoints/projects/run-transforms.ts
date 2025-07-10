import { z } from 'zod';
import { createEndpoint } from '../../create-endpoint';
import { _parseProject, _runTransforms } from './utils';

export const runTransforms = createEndpoint({
  type: 'POST',
  pathname: '/projects/transforms',
  params: z.object({
    id: z.string(),
    content: z.array(z.object({ path: z.string(), content: z.string() })),
  }),
  handler: async ({ parsed }) => {
    const { content, id } = parsed;
    const project = await _parseProject(id);
    const result = await _runTransforms(project, content);
    return {
      result,
    };
  },
});
