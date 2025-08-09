import { ServerPlugin } from '../_types/plugin.server';
import {
  detectPackageManager,
  getPackageJson,
  isInstalled,
} from '@/plugins/npm/server/detect-package-manager';
import { id } from './plugin.shared';
import { Project } from '@/server/project/types';
import { listHomeShellProcesses } from './server/list-shell-processes';

// re-implemnt this wacky api to be compitable with old plugin api
// * refactor later
async function setup(project: Project) {
  const packageManager = await detectPackageManager(project.path);
  const pkgJson = await getPackageJson(project.path);
  const shellProcesses = await listHomeShellProcesses();

  project.plugins[id] = {
    id,
    tools: [],
    sourceCodeHooks: [],
    info: {
      packageManager,
      config: JSON.stringify(pkgJson, null, 2),
      shellProcesses: JSON.stringify(
        shellProcesses.filter((p) => p.cwd === project.path)
      ),
      isInstalled: JSON.stringify(isInstalled(project.path)),
    },
  };
}

export const Plugin: ServerPlugin = {
  description:
    'Detects the package manager (npm, yarn, pnpm, bun) for Node.js projects and exposes npm-related metadata.',
  id,
  createContext: async (baseProject) => {
    await setup(baseProject);
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
    if (packageManager !== 'unknown') {
      await setup(project);
    }
    return packageManager !== 'unknown';
  },
};
