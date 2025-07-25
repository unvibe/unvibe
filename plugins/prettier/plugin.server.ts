import * as virtualFiles from './server/virtual-files';
import { id } from './plugin.shared';

import { ServerPlugin } from '../_types/plugin.server';

export const Plugin: ServerPlugin = {
  description:
    'Provides code formatting for many filetypes using Prettier, based on project configuration files.',
  id,
  sourceCodeHooks: [
    {
      name: 'prettier-format',
      rule: /(.ts|.tsx|.js|.jsx|.json|.md|.css|.scss|.html|.yaml|.yml|.graphql|.vue|.svelte)$/,
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
    const prettierConfigFiles = [
      '.prettierrc',
      '.prettierrc.json',
      '.prettierrc.js',
      '.prettierrc.cjs',
      '.prettierrc.yaml',
      '.prettierrc.yml',
      'prettier.config.js',
      'prettier.config.cjs',
      '.prettierignore',
    ];

    if (
      project.paths.some((file) =>
        prettierConfigFiles.some((config) => file.endsWith(config))
      )
    ) {
      return true;
    }
    return false;
  },
};
