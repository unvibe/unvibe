import { ServerPlugin } from '../_types/plugin.server';
import { id } from './plugin.shared';
import fs from 'node:fs';
import path from 'node:path';

function readDeps(projectPath: string): string[] {
  try {
    const pkgPath = path.join(projectPath, 'package.json');
    const raw = fs.readFileSync(pkgPath, 'utf8');
    const pkg = JSON.parse(raw);
    return [
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.devDependencies || {}),
    ];
  } catch {
    return [];
  }
}

export const Plugin: ServerPlugin = {
  id,
  metadata: {
    hooks: [],
    tools: [],
    system: [],
  },
  description:
    'Shows how routes, entry points, and layouts are set up and previews navigation structure.',
  detect: async (project) => {
    const deps = readDeps(project.path);
    return deps.includes('react-router') || deps.includes('react-router-dom');
  },
  setup: async (project) => project,
  createContext: async () => ({ tools: {}, systemParts: {} }),
};
