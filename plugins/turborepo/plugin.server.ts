import { ServerPlugin } from '../_types/plugin.server';
import { checkMonorepo } from './server/lib/is-turborepo';
import { id } from './plugin.shared';

export const Plugin: ServerPlugin = {
  metadata: {
    hooks: [],
    tools: [],
    system: [],
  },
  description:
    'Detects and augments monorepos managed by Turborepo, extracting workspace/project structure.',
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
