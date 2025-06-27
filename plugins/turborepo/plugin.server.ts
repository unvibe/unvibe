import { ServerPlugin } from '../_types/plugin.server';
import { checkMonorepo } from './server/lib/is-turborepo';
import { id } from './plugin.shared';

export const Plugin: ServerPlugin = {
  id,
  api: {},
  sourceCodeHooks: [],
  createContext: async () => {
    return {
      tools: {},
      systemParts: {},
    };
  },
  detect: async (project) => {
    // determine if the the project is a turborepo monorepo
    const monorepoCheckResult = await checkMonorepo(project.path);
    return monorepoCheckResult.isMonorepo;
  },
  setup: async (project) => {
    const monorepoCheckResult = await checkMonorepo(project.path);
    const workspaces = monorepoCheckResult.workspaces;

    project.plugins[id] = {
      id,
      tools: [],
      sourceCodeHooks: [],
      info: {
        workspaces: JSON.stringify(workspaces, null, 2),
      },
    };

    return project;
  },
};
