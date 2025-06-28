import { z } from 'zod';
import { createEndpoint } from '../../create-endpoint';
import * as PluginsMap from '@/plugins/plugins.server';
import { Project } from '@/plugins/core/server/api/lib/project';
import {
  SourceCodeDiagnosticHook,
  SourceCodeHook,
  SourceCodeTransformHook,
  VirtualFile,
} from '@/plugins/_types/plugin.server';
import { resolveHomePath } from '@/plugins/core/server/api/lib/resolve-home-path';
import { noop } from '@/lib/core/noop';
import { runShellCommand } from '@/plugins/core/server/api/lib/run-shell-command';
import fs from 'node:fs/promises';
import path from 'node:path';

const allPlugins = Object.values(PluginsMap).map((plugin) => plugin.Plugin);

export * as PluginsMap from '@/plugins/plugins.server';

export const normalizePath = (p: string) => (p.startsWith('./') ? p : `./${p}`);

export async function loadPlugins(project: Project) {
  return await Promise.all(
    Object.values(PluginsMap).filter((plugin) =>
      Object.keys(project.plugins).includes(plugin.Plugin.id)
    )
  );
}

export const _runScript = PluginsMap.CorePlugin.Plugin.api.runScript;
export const _killScript = PluginsMap.CorePlugin.Plugin.api.killScript;

export async function _packageManagerCommands(
  packages: {
    install: string[];
    uninstall: string[];
  },
  projectId: string
): Promise<string> {
  const install = `npm install ${packages.install.join(' ')}`;
  const uninstall = `npm uninstall ${packages.uninstall.join(' ')}`;
  let command = '';
  if (packages.uninstall.length > 0) {
    command += uninstall;
  }
  if (packages.install.length > 0) {
    if (command.length > 0) {
      command += ' && ';
    }
    command += install;
  }
  if (command.length === 0) {
    return 'No packages to install or uninstall';
  }
  const result = runShellCommand(command, {
    cwd: resolveHomePath(`projects/${projectId}`),
  });

  return result;
}

export async function _runTransforms(
  project: Project,
  files: { path: string; content: string }[]
) {
  const plugins = await loadPlugins(project);

  const transformHooks = plugins
    .map((plugin) => plugin.Plugin.sourceCodeHooks)
    .filter((hook): hook is SourceCodeHook[] => !!hook)
    .flat()
    .filter((hook): hook is SourceCodeTransformHook =>
      Boolean(hook.operations.diagnostic)
    );

  let virtualFiles: VirtualFile[] = files;

  for (const hook of transformHooks) {
    const hookFiles = files.filter((file) => hook.rule.test(file.path));
    if (hookFiles.length === 0) {
      continue;
    }
    virtualFiles = await hook.operations.transform(virtualFiles, project.path);
  }

  return virtualFiles;
}

export async function _modifyFiles(
  entries: {
    path: string;
    content?: string;
    operation: 'write' | 'delete';
  }[],
  projectId: string
) {
  const projectPath = resolveHomePath(`projects/${projectId}`);

  return await Promise.all(
    entries.map(async (entry) => {
      if (entry.operation === 'write') {
        const dir = entry.path.split('/').slice(0, -1).join('/');
        await fs.mkdir(path.join(projectPath, dir), { recursive: true });
        await fs.writeFile(
          path.join(projectPath, entry.path),
          entry.content ?? '',
          'utf-8'
        );
      } else if (entry.operation === 'delete') {
        try {
          await fs.unlink(entry.path);
        } catch (error) {
          // ignore if file doesn't exist
          noop(error);
        }
      }
    })
  );
}

export function _parseProject(
  source: Parameters<typeof PluginsMap.CorePlugin.Plugin.api.parseProject>[0],
  path: Parameters<typeof PluginsMap.CorePlugin.Plugin.api.parseProject>[1]
) {
  return PluginsMap.CorePlugin.Plugin.api.parseProject(
    source,
    path,
    allPlugins
  );
}
