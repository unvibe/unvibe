import * as PluginsMap from '@/plugins/plugins.server';
import { Project } from '@/plugins/core/server/api/lib/project';
import {
  SourceCodeDiagnosticHook,
  SourceCodeHook,
  SourceCodeTransformHook,
  VirtualFile,
} from '@/plugins/_types/plugin.server';
import { resolveHomePath } from '@/server/project/utils';
import { noop } from '@/lib/core/noop';
import { runShellCommand } from '@/plugins/core/server/api/lib/run-shell-command';
import fs from 'node:fs/promises';
import path from 'node:path';
import { StructuredOutput } from '@/server/llm/structured_output';
import { applyRangeEdits } from '@/server/llm/structured_output/resolve-edits';
import { parseProject } from '@/server/project/parse';

export { runScript as _runScript } from '@/plugins/core/server/api/run-script';
export { killScript as _killScript } from '@/plugins/core/server/api/kill-script';

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

export function _parseProject(
  source: Parameters<typeof parseProject>[0],
  path: Parameters<typeof parseProject>[1]
) {
  return parseProject(source, path, allPlugins);
}

export async function runProposalDiagnostics(
  proposal: StructuredOutput,
  project: Project
) {
  const plugins = await loadPlugins(project);
  const addedFiles = proposal.replace_files || [];
  const deletedFiles = proposal.delete_files || [];
  const editedFiles = proposal.edit_files || [];
  const editedRanges = proposal.edit_ranges || [];
  const content = [
    ...addedFiles,
    ...deletedFiles.map((file) => ({ path: file.path, content: '' })),
    ...editedRanges.map((range) => {
      const source =
        project.EXPENSIVE_REFACTOR_LATER_content[normalizePath(range.path)] ||
        '';
      const newSource = applyRangeEdits(source, range.edits);
      return {
        path: range.path,
        content: newSource,
      };
    }),
    ...editedFiles.map((file) => {
      const source =
        project.EXPENSIVE_REFACTOR_LATER_content[normalizePath(file.path)] ||
        '';
      // todo apply the range to the source
      // Apply the edit by lines
      const sourceLines = source.split('\n');
      const editLines = file.content.split('\n');
      // split the source lines in two parts
      const newLines = [...sourceLines];
      newLines.splice(file.insert_at - 1, 0, ...editLines);
      const appliedContent = newLines.join('\n');
      return {
        path: file.path,
        content: appliedContent,
      };
    }),
  ];

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
