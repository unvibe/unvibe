import { ServerPlugin } from '../_types/plugin.server';
import {
  detectPackageManager,
  getPackageJson,
  isInstalled as checkIsInstalled,
} from '@/plugins/npm/server/detect-package-manager';
import { id } from './plugin.shared';
import { listHomeShellProcesses } from './server/list-shell-processes';

export const Plugin: ServerPlugin = {
  id,
  api: {},
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
  setup: async (project) => {
    const packageManager = await detectPackageManager(project.path);
    const pkgJson = await getPackageJson(project.path);
    const shellProcesses = await listHomeShellProcesses();
    const isInstalled = await checkIsInstalled(project.path);

    project.plugins[id] = {
      id,
      tools: [],
      sourceCodeHooks: [],
      info: {
        packageManager,
        config: JSON.stringify(pkgJson, null, 2),
        isInstalled: JSON.stringify(isInstalled),
        shellProcesses: JSON.stringify(
          shellProcesses.filter((p) => p.cwd === project.path)
        ),
      },
    };

    return project;
  },
};
