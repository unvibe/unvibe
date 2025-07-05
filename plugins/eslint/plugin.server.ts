import * as virtualFiles from './server/virtual-files';
import { id } from './plugin.shared';
import fs from 'node:fs/promises';
import path from 'node:path';

import { ServerPlugin } from '../_types/plugin.server';

export const Plugin: ServerPlugin = {
  metadata: {
    hooks: [
      {
        name: 'eslint-lint',
        rule: '/(\\.ts|\\.tsx|\\.js|\\.jsx)$/',
        operations: ['diagnostic'],
      },
    ],
    tools: [],
    system: [],
  },
  description:
    'Adds ESLint linting for JavaScript and TypeScript files if ESLint config is found in the project.',
  id,
  sourceCodeHooks: [
    {
      name: 'eslint-lint',
      rule: /(\.ts|\.tsx|\.js|\.jsx)$/,
      operations: {
        diagnostic: virtualFiles.lint,
      },
    },
  ],
  detect: async (project) => {
    const configFiles = [
      '.eslintrc',
      '.eslintrc.js',
      '.eslintrc.cjs',
      '.eslintrc.json',
      '.eslintrc.yaml',
      '.eslintrc.yml',
      'eslint.config.js',
      'eslint.config.mjs',
      'eslint.config.cjs',
      'eslint.config.ts',
      '.eslintignore',
    ];

    const hasConfig = project.paths.some((file) =>
      configFiles.some((config) => file.endsWith(config))
    );

    if (hasConfig) return true;

    // check pkg.json for eslint config
    const pkgJson = project.paths.find((file) => file.endsWith('package.json'));
    const pkgJsonPath = pkgJson ? path.join(project.path, pkgJson) : null;
    if (!pkgJsonPath) return false;
    const pkgJsonContent = pkgJson
      ? await fs.readFile(pkgJsonPath, 'utf-8')
      : null;
    if (!pkgJsonContent) return false;
    try {
      const pkgJsonParsed = JSON.parse(pkgJsonContent);
      if (pkgJsonParsed && pkgJsonParsed.eslintConfig) {
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
  createContext: async () => {
    return {
      tools: {},
      systemParts: {},
    };
  },
};
