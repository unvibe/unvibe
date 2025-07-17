import { ServerPlugin } from '../_types/plugin.server';
import { detectPackageManager } from '@/plugins/npm/server/detect-package-manager';
import { id } from './plugin.shared';

export const Plugin: ServerPlugin = {
  description:
    'Detects the package manager (npm, yarn, pnpm, bun) for Node.js projects and exposes npm-related metadata.',
  id,
  createContext: async (baseProject) => {
    const packageManager = baseProject.plugins[id]?.info?.packageManager;
    return {
      tools: {},
      systemParts: {
        npm_info: `this project contains a package.json file and uses ${packageManager} as its package manager`,
      },
    };
  },
  detect: async (project) => {
    const packageManager = await detectPackageManager(project.path);
    return packageManager !== 'unknown';
  },
};
