import { Project } from '@/server/project/types';
import { _parseProject } from './utils';
import { createEndpoint } from '../../create-endpoint';
import { z } from 'zod';

export const parseProject = createEndpoint({
  type: 'GET',
  pathname: '/projects/parse-project',
  params: z.object({
    id: z.string(), // project id
  }),
  handler: async ({ parsed }) => {
    const { id } = parsed;
    const project = await _parseProject(id);

    const projectWithoutContent: Project = {
      ...project,
      EXPENSIVE_REFACTOR_LATER_content: {},
    };
    const size = Object.values(project.EXPENSIVE_REFACTOR_LATER_content).join(
      ''
    ).length;

    return {
      size,
      project: projectWithoutContent,
    };
  },
});
