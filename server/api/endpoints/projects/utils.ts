import * as PluginsMap from '@/plugins/plugins.server';
import { Project } from '@/server/project/types';
import {
  SourceCodeDiagnosticHook,
  SourceCodeHook,
  SourceCodeTransformHook,
  VirtualFile,
} from '@/plugins/_types/plugin.server';
import { resolveHomePath } from '@/server/project/utils';
import { noop } from '@/lib/core/noop';
import { runShellCommand } from '@/lib/server/run-shell-command';
import fs from 'node:fs/promises';
import path from 'node:path';
import { parseProject } from '@/server/project/parse';
export {
  runScript as _runScript,
  killScript as _killScript,
} from '@/server/project/EXPERIMENTAL_scripts';

export async function getCurrentUsername(): Promise<string | null> {
  try {
    const output = await runShellCommand('gh api user --jq .login');
    return output.trim();
  } catch {
    return null;
  }
}

export async function getOrgs(): Promise<string[]> {
  try {
    const output = await runShellCommand("gh api user/orgs --jq '.[].login'");
    return output
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}

async function getReposForOwner(owner: string): Promise<string[]> {
  try {
    const output = await runShellCommand(
      `gh repo list ${owner} --json name --jq '.[].name'`
    );
    return output
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}

export async function listRemote(): Promise<Record<string, string[]>> {
  const result: Record<string, string[]> = {};
  const username = await getCurrentUsername();
  if (username) {
    result[username] = await getReposForOwner(username);
  }
  const orgs = await getOrgs();
  for (const org of orgs) {
    result[org] = await getReposForOwner(org);
  }
  return result;
}

export async function importRemoteProject(url: string): Promise<boolean> {
  // Placeholder for actual import logic
  return !!url;
}

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

export function _parseProject(id: string) {
  return parseProject(id, allPlugins);
}

export async function runDiagnostics(project: Project, content: VirtualFile[]) {
  const plugins = await loadPlugins(project);
  // console.log('content after edit', content);
  // run diagnostics on the content
  const diagnosticHooks = plugins
    .map((plugin) => plugin.Plugin.sourceCodeHooks)
    .filter((hook): hook is SourceCodeHook[] => !!hook)
    .flat()
    .filter((hook): hook is SourceCodeDiagnosticHook =>
      Boolean(hook.operations.diagnostic)
    );

  const hookPromises: Promise<{ name: string; result: string }>[] = [];

  for (const hook of diagnosticHooks) {
    const hookFiles = content.filter((file) => hook.rule.test(file.path));
    if (hookFiles.length === 0) {
      continue;
    }
    const task = async () => {
      try {
        const diagnosticResult = await hook.operations.diagnostic(
          hookFiles,
          project.path
        );
        return { name: hook.name, result: diagnosticResult };
      } catch (error) {
        console.error(`Failed to run diagnostic hook ${hook.name}:`, error);
        return { name: hook.name, result: '{}' };
      }
    };

    hookPromises.push(task());
  }

  return await Promise.all(hookPromises);
}
