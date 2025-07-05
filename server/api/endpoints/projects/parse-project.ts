import { Project } from '@/server/project/types';
import { _parseProject } from './utils';
import { createEndpoint } from '../../create-endpoint';
import { z } from 'zod';

export const parseProject = createEndpoint({
  type: 'GET',
  pathname: '/projects/parse-project',
  params: z.object({
    source: z.string(),
    projectDirname: z.string(),
  }),
  handler: async ({ parsed }) => {
    const { source, projectDirname } = parsed;
    const project = await _parseProject(source, projectDirname);

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
