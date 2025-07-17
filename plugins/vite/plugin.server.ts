import { ServerPlugin } from '../_types/plugin.server';
import { id } from './plugin.shared';

export const Plugin: ServerPlugin = {
  id,
  description: 'Detects Vite config, entrypoints, and build pipeline info.',
  detect: async () => false,
  createContext: async () => ({ tools: {}, systemParts: {} }),
};
