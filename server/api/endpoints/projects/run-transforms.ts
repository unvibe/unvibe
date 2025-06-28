import { z } from 'zod';
import { createEndpoint } from '../../create-endpoint';
import { _parseProject, _runTransforms } from './utils';

export const runTransforms = createEndpoint({
  type: 'POST',
  pathname: '/projects/transforms',
  params: z.object({
    source: z.string(),
    projectDirname: z.string(),
    content: z.array(z.object({ path: z.string(), content: z.string() })),
  }),
  handler: async ({ parsed }) => {
    const { source, projectDirname, content } = parsed;
    const project = await _parseProject(source, projectDirname);
    const result = await _runTransforms(project, content);
    return {
      result,
    };
  },
});
