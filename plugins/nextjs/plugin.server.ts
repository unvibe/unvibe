import { ServerPlugin } from '../_types/plugin.server';
import { id } from './plugin.shared';

export const Plugin: ServerPlugin = {
  id,
  metadata: {
    hooks: [],
    tools: [],
    system: [],
  },
  description:
    'Shows how pages, entry points, and layouts are structured (app dir, pages dir) and previews UI setup.',
  detect: async (project) => {
    return project.paths.some(
      (f) =>
        f.endsWith('next.config.js') ||
        f.endsWith('next.config.ts') ||
        f.startsWith('pages/') ||
        f.startsWith('app/')
    );
  },
  setup: async (project) => project,
  createContext: async () => ({ tools: {}, systemParts: {} }),
};
