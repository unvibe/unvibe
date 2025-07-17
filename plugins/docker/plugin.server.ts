import { ServerPlugin } from '../_types/plugin.server';
import { id } from './plugin.shared';

export const Plugin: ServerPlugin = {
  id,
  description: 'Detects Dockerfiles/compose and outlines build/run setup.',
  detect: async (project) => {
    return project.paths.some(
      (f) => f.endsWith('Dockerfile') || f.endsWith('docker-compose.yml')
    );
  },
  createContext: async () => ({ tools: {}, systemParts: {} }),
};
