import * as virtualFiles from './server/virtual-files';
import { id } from './plugin.shared';
import { ServerPlugin } from '../_types/plugin.server';
// import * as tools from './server/tools';

export const Plugin: ServerPlugin = {
  id,
  api: {},
  sourceCodeHooks: [
    {
      name: 'go-check',
      rule: /\.go$/,
      operations: {
        diagnostic: virtualFiles.check,
      },
    },
    {
      name: 'go-format',
      rule: /\.go$/,
      operations: {
        transform: virtualFiles.format,
      },
    },
  ],
  createContext: async () => {
    return {
      tools: {},
      systemParts: {},
    };
  },
  detect: async (project) => {
    return project.paths.some(
      (file) => file.endsWith('go.mod') || file.endsWith('.go')
    );
  },
  setup: async (project) => {
    project.plugins[id] = {
      id,
      // tools: Object.values(tools).map((tool) => tool.config),
      tools: [],
      info: {},
      sourceCodeHooks: (Plugin.sourceCodeHooks || []).map((hook) => ({
        name: hook.name,
        rule: hook.rule.source,
        operations: {
          diagnostic: !!hook.operations.diagnostic,
          trasnform: !!hook.operations.transform,
        },
      })),
    };
    return project;
  },
};
