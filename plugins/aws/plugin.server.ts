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
  description: 'Detects usage of AWS SDK/services and summarizes cloud setup.',
  detect: async (project) => {
    const deps = readDeps(project.path);
    return (
      deps.includes('aws-sdk') ||
      deps.some((d) => d.startsWith('@aws-sdk/')) ||
      project.paths.some((f) => f.endsWith('serverless.yml'))
    );
  },
  createContext: async () => ({ tools: {}, systemParts: {} }),
};
