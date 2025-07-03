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
    'shows how routes, entry points, and layouts are set up and previews navigation structure.',
  detect: async () => false,
  setup: async (project) => project,
  createContext: async () => ({ tools: {}, systemParts: {} }),
  api: {},
};
