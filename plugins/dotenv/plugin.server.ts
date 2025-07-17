import { ServerPlugin } from '../_types/plugin.server';
import { id } from './plugin.shared';

export const Plugin: ServerPlugin = {
  id,
  description: 'Detects .env files and lists env keys (no secrets).',
  detect: async (project) => {
    return project.paths.some((f) => f.match(/^\.env($|\.)/));
  },
  createContext: async () => ({ tools: {}, systemParts: {} }),
};
