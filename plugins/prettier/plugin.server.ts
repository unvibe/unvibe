import * as virtualFiles from './server/virtual-files';
import { id } from './plugin.shared';
import fs from 'node:fs/promises';
import path from 'node:path';

import { ServerPlugin } from '../_types/plugin.server';

export const Plugin: ServerPlugin = {
  metadata: {
    hooks: [
      {
        name: 'prettier-format',
        rule: '/(\\.ts|\\.tsx|\\.js|\\.jsx|\\.json|\\.md|\\.css|\\.scss|\\.html|\\.yaml|\\.yml|\\.graphql|\\.vue|\\.svelte)$/',
        operations: ['transform'],
      },
    ],
    tools: [],
    system: [],
  },
  id,
  api: {},
  sourceCodeHooks: [
    {
      name: 'prettier-format',
      rule: /(\.ts|\.tsx|\.js|\.jsx|\.json|\.md|\.css|\.scss|\.html|\.yaml|\.yml|\.graphql|\.vue|\.svelte)$/,
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

    const pkgJson = project.paths.find((file) => file.endsWith('package.json'));
    const pkgJsonPath = pkgJson ? path.join(project.path, pkgJson) : null;
    if (!pkgJsonPath) return false;
    const pkgJsonContent = pkgJson
      ? await fs.readFile(pkgJsonPath, 'utf-8')
      : null;
    if (!pkgJsonContent) return false;
    try {
      const pkgJsonParsed = JSON.parse(pkgJsonContent);
      if (pkgJsonParsed && pkgJsonParsed.prettier) {
        return true;
      } else {
        return false;
      }
    } catch {
      return false;
    }
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
