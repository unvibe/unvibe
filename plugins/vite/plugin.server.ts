import { ServerPlugin } from '../_types/plugin.server';
import { id } from './plugin.shared';

export const Plugin: ServerPlugin = {
  id,
  metadata: { hooks: [], tools: [], system: [] },
  description: 'Detects Vite config, entrypoints, and build pipeline info.',
  detect: async () => false,
  setup: async (project) => project,
  createContext: async () => ({ tools: {}, systemParts: {} }),
};
