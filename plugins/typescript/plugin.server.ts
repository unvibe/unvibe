import * as virtualFiles from './server/virtual-files';
import { id } from './plugin.shared';

import { ServerPlugin } from '../_types/plugin.server';

export const Plugin: ServerPlugin = {
  metadata: {
    hooks: [
      {
        name: 'ts-check',
        rule: '/(\\.ts|\\.tsx|\\.js|\\.jsx)$/',
        operations: ['diagnostic'],
      },
    ],
    tools: [],
    system: [],
  },
  description:
    'Provides TypeScript/JavaScript type checking and diagnostics for projects with a tsconfig.json.',
  id,
  sourceCodeHooks: [
    {
      name: 'ts-check',
      rule: /(\.ts|\.tsx|\.js|\.jsx)$/,
      operations: {
        diagnostic: virtualFiles.check,
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
    return project.paths.some((file) => file.endsWith('tsconfig.json'));
  },
  setup: async (project) => {
    project.plugins[id] = {
      id,
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
