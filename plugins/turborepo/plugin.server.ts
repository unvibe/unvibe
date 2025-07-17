import { ServerPlugin } from '../_types/plugin.server';
import { checkMonorepo } from './server/lib/is-turborepo';
import { id } from './plugin.shared';

export const Plugin: ServerPlugin = {
  description:
    'Detects and augments monorepos managed by Turborepo, extracting workspace/project structure.',
  id,
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
};
