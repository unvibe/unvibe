import * as virtualFiles from './server/virtual-files';
import { id } from './plugin.shared';
import { ServerPlugin } from '../_types/plugin.server';
// import * as tools from './server/tools';

export const Plugin: ServerPlugin = {
  description:
    'Adds Go language support: linting and formatting for .go files, triggered by go.mod or Go source detection.',
  id,
  sourceCodeHooks: [
    {
      name: 'go-check',
      rule: /.go$/,
      operations: {
        diagnostic: virtualFiles.check,
      },
    },
    {
      name: 'go-format',
      rule: /.go$/,
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
};
