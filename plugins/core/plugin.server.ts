import { ServerPlugin } from '../_types/plugin.server';
import * as api from './server/api';
import * as tools from './server/tools';
import { id } from './plugin.shared';
import { character } from './server/lib/system-parts';
import { summarizeFilePaths } from './server/lib/summarize-file-paths';

export const Plugin: ServerPlugin<typeof api> = {
  metadata: {
    hooks: [],
    tools: Object.values(tools).map((tool) => tool.config?.name || 'unknown'),
    system: ['character', 'files_summary', 'os_info'],
  },
  description:
    'Core plugin: provides basic project context, core system tools (character, file summary, os info), and project-wide utilities.',
  id,
  api,
  detect: async () => Promise.resolve(true),
  setup: async (project) => {
    project.plugins[id] = {
      id,
      info: {},
      tools: Object.values(tools).map((tool) => tool.config),
      sourceCodeHooks: [],
    };
    return project;
  },
  createContext: async (project) => {
    return {
      tools,
      systemParts: {
        character,
        files_summary: summarizeFilePaths(project.paths),
        os_info: JSON.stringify({
          platform: process.platform,
          arch: process.arch,
        }),
      },
    };
  },
};
