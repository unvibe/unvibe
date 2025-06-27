import { z } from 'zod';
import { createEndpoint } from '../create-endpoint';
import { listLocal } from '@/plugins/core/server/api';
import * as PluginsMap from '@/plugins/plugins.server';
import { Project } from '@/plugins/core/server/api/lib/project';
import {
  SourceCodeDiagnosticHook,
  SourceCodeHook,
  SourceCodeTransformHook,
  VirtualFile,
} from '@/plugins/_types/plugin.server';
import { resolveHomePath } from '@/plugins/core/server/api/lib/resolve-home-path';
import fs from 'node:fs/promises';
import path from 'node:path';
import { noop } from '@/lib/core/noop';
import { runShellCommand } from '@/plugins/core/server/api/lib/run-shell-command';
import simpleGit from 'simple-git';
import { db, schema } from '@/server/db';

const allPlugins = Object.values(PluginsMap).map((plugin) => plugin.Plugin);

async function loadPlugins(project: Project) {
  return await Promise.all(
    Object.values(PluginsMap).filter((plugin) =>
      Object.keys(project.plugins).includes(plugin.Plugin.id)
    )
  );
}

const _runScript = PluginsMap.CorePlugin.Plugin.api.runScript;
const _killScript = PluginsMap.CorePlugin.Plugin.api.killScript;

async function _packageManagerCommands(
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
async function _runDiagnostics(
  project: Project,
  files: { path: string; content: string }[]
) {
  const plugins = await loadPlugins(project);
  const diagnosticHooks = plugins
    .map((plugin) => plugin.Plugin.sourceCodeHooks)
    .filter((hook): hook is SourceCodeHook[] => !!hook)
    .flat()
    .filter((hook): hook is SourceCodeDiagnosticHook =>
      Boolean(hook.operations.diagnostic)
    );

  const hookPromises: Promise<{ name: string; result: string }>[] = [];

  for (const hook of diagnosticHooks) {
    const hookFiles = files.filter((file) => hook.rule.test(file.path));
    if (hookFiles.length === 0) {
      continue;
    }
    const task = async () => {
      const diagnosticResult = await hook.operations.diagnostic(
        hookFiles,
        project.path
      );
      return { name: hook.name, result: diagnosticResult };
    };

    hookPromises.push(task());
  }

  return await Promise.all(hookPromises);
}

async function _runTransforms(
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

async function _modifyFiles(
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
function _parseProject(
  source: Parameters<typeof PluginsMap.CorePlugin.Plugin.api.parseProject>[0],
  path: Parameters<typeof PluginsMap.CorePlugin.Plugin.api.parseProject>[1]
) {
  return PluginsMap.CorePlugin.Plugin.api.parseProject(
    source,
    path,
    allPlugins
  );
}

export const listProjects = createEndpoint({
  type: 'GET',
  pathname: '/projects/list',
  params: z.object({
    sources: z.string(),
  }),
  handler: async ({ parsed }) => {
    const { sources } = parsed;

    // from the ~ comma seperated list of directories that are a root of a project
    const projects = await listLocal(sources.split(','));

    return {
      projects,
    };
  },
});

export const parseProject = createEndpoint({
  type: 'GET',
  pathname: '/projects/parse-project',
  params: z.object({
    source: z.string(),
    projectDirname: z.string(),
  }),
  handler: async ({ parsed }) => {
    const { source, projectDirname } = parsed;
    const project = await _parseProject(source, projectDirname);

    const projectWithoutContent: Project = {
      ...project,
      EXPENSIVE_REFACTOR_LATER_content: {},
    };
    const size = Object.values(project.EXPENSIVE_REFACTOR_LATER_content).join(
      ''
    ).length;

    return {
      size,
      project: projectWithoutContent,
    };
  },
});

export const listRemote = createEndpoint({
  type: 'GET',
  pathname: '/projects/remote/list',
  params: z.object({}),
  handler: async () => {
    const result = await PluginsMap.CorePlugin.Plugin.api.listRemote();
    return {
      projects: result,
    };
  },
});

export const listRemoteOrgs = createEndpoint({
  type: 'GET',
  pathname: '/projects/remote/orgs/list',
  params: z.object({}),
  handler: async () => {
    const [result, remoteUsername] = await Promise.all([
      PluginsMap.CorePlugin.Plugin.api.getOrgs(),
      PluginsMap.CorePlugin.Plugin.api.getCurrentUsername(),
    ]);
    if (remoteUsername) {
      result.unshift(remoteUsername);
    }
    return {
      orgs: result,
    };
  },
});

export const runDiagnostics = createEndpoint({
  type: 'POST',
  pathname: '/projects/diagnostics',
  params: z.object({
    source: z.string(),
    projectDirname: z.string(),
    content: z.array(z.object({ path: z.string(), content: z.string() })),
  }),
  handler: async ({ parsed }) => {
    const { source, projectDirname, content } = parsed;
    const project = await _parseProject(source, projectDirname);
    const result = await _runDiagnostics(project, content);
    return {
      result,
    };
  },
});

export const runTransforms = createEndpoint({
  type: 'POST',
  pathname: '/projects/transforms',
  params: z.object({
    source: z.string(),
    projectDirname: z.string(),
    content: z.array(z.object({ path: z.string(), content: z.string() })),
  }),
  handler: async ({ parsed }) => {
    const { source, projectDirname, content } = parsed;
    const project = await _parseProject(source, projectDirname);
    const result = await _runTransforms(project, content);
    return {
      result,
    };
  },
});

export const runScript = createEndpoint({
  type: 'POST',
  pathname: '/projects/run-script',
  params: z.object({
    source: z.string(),
    projectDirname: z.string(),
    command: z.string(),
    args: z.array(z.string()),
  }),
  handler: async ({ parsed }) => {
    const { source, projectDirname, command, args } = parsed;
    const project = await _parseProject(source, projectDirname);
    const processMetadata = await _runScript(project, command, args);
    return {
      processMetadata,
    };
  },
});

export const killScript = createEndpoint({
  type: 'POST',
  pathname: '/projects/kill-script',
  params: z.object({
    source: z.string(),
    projectDirname: z.string(),
    processMetadata: z.object({
      id: z.string(),
      pid: z.number(),
      state: z.enum(['running', 'stopped']),
      command: z.string(),
      args: z.array(z.string()),
      exitCode: z.number().optional(),
      stdout: z.string(),
      stderr: z.string(),
      cwd: z.string(),
    }),
  }),
  handler: async ({ parsed }) => {
    const { source, projectDirname, processMetadata } = parsed;
    const project = await _parseProject(source, projectDirname);

    const result = _killScript(project, processMetadata);

    return {
      processMetadata: result,
    };
  },
});

export const modifyFiles = createEndpoint({
  type: 'POST',
  pathname: '/projects/modify-files',
  params: z.object({
    projectId: z.string(),
    entries: z.array(
      z.object({
        path: z.string(),
        content: z.string().optional(),
        operation: z.enum(['write', 'delete']),
      })
    ),
  }),
  handler: async ({ parsed }) => {
    const { projectId, entries } = parsed;
    try {
      if (!projectId) {
        return {
          success: false,
          error: 'projectId is required',
        };
      }
      if (!Array.isArray(entries)) {
        return {
          success: false,
          error: 'entries must be an array',
        };
      }
      await _modifyFiles(entries, projectId);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  },
});

export const packageManagerCommands = createEndpoint({
  type: 'POST',
  pathname: '/projects/package-manager-commands',
  params: z.object({
    projectId: z.string(),
    packages: z.object({
      install: z.array(z.string()),
      uninstall: z.array(z.string()),
    }),
  }),
  handler: async ({ parsed }) => {
    const { projectId, packages } = parsed;
    return {
      message: await _packageManagerCommands(packages, projectId),
    };
  },
});

export const diffContent = createEndpoint({
  type: 'POST',
  pathname: '/projects/diff-content',
  params: z.object({
    path: z.string(),
    content: z.string(),
    projectId: z.string(),
  }),
  handler: async ({ parsed }) => {
    const { path: filePath, content, projectId } = parsed;
    const tempPath = `/tmp/${Date.now()}_temp_file`;
    try {
      // make tempfile
      const tempFilePath = tempPath;
      const tempFileContent = content;
      await fs.writeFile(tempFilePath, tempFileContent);
      const rootPath = resolveHomePath(`projects/${projectId}`);
      const resolvedFilePath = path.join(rootPath, filePath);

      const fileExists = await fs
        .access(resolvedFilePath)
        .then(() => true)
        .catch(() => false);

      if (!fileExists) {
        return {
          diff: '',
          fileExists,
        };
      }
      const git = simpleGit({
        baseDir: rootPath,
        binary: 'git',
        maxConcurrentProcesses: 6,
      });

      const diff = await git.diff([
        '--no-index',
        resolvedFilePath,
        tempFilePath,
      ]);
      try {
        await fs.unlink(tempFilePath);
      } catch {}
      return { diff, fileExists };
    } catch (error) {
      // clear any temp files
      try {
        await fs.unlink(tempPath);
      } catch {}
      if (error instanceof Error) {
        return {
          message: `Error: ${error.message}`,
        };
      }
      return {
        message: `Error: ${JSON.stringify(error)}`,
      };
    }
  },
});

export const saveSystemPart = createEndpoint({
  type: 'POST',
  pathname: '/projects/save-system-part',
  params: z.object({
    projectId: z.string(),
    type: z.enum(['raw', 'file']),
    key: z.string(),
    value: z.string(),
  }),
  handler: async ({ parsed }) => {
    await db.insert(schema.customSystemParts).values({
      id: crypto.randomUUID(),
      project_id: parsed.projectId,
      type: parsed.type,
      key: parsed.key,
      value: parsed.value,
    });

    return {
      message: 'System part saved successfully',
    };
  },
});

export const requestFile = createEndpoint({
  type: 'GET',
  pathname: '/projects/request-file',
  params: z.object({
    projectId: z.string(),
    filePath: z.string(),
  }),
  handler: async ({ parsed }) => {
    const { projectId, filePath } = parsed;
    const fileAbsolutePath = resolveHomePath(
      path.join(`projects/${projectId}`, filePath)
    );
    try {
      const content = await fs.readFile(fileAbsolutePath, 'utf-8');
      return {
        content,
        filePath: path.basename(filePath),
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : String(error),
      };
    }
  },
});
