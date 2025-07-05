import { BaseProject, Project } from '@/server/project/types';
import { resolveHomePath } from './utils';
import path from 'node:path';
import type { ServerPlugin } from '@/plugins/_types/plugin.server';
import { db } from '@/server/db';
import { scanProjectFilesWithCache } from './scan-and-cache';
import type { FileCache } from './cache';
import fs from 'node:fs/promises';

// Load and persist cache for each project directory
async function loadCache(projectPath: string): Promise<FileCache> {
  const base64 = Buffer.from(projectPath).toString('base64');
  const cacheDir = path.join(resolveHomePath('.unvibe'), '.unvibe-cache');
  // ensure cache directory exists
  await fs.mkdir(cacheDir, { recursive: true });
  const cachePath = path.join(cacheDir, `${base64}.json`);
  try {
    const content = await fs.readFile(cachePath, 'utf8');
    return JSON.parse(content);
  } catch {
    return {};
  }
}

async function saveCache(projectPath: string, cache: FileCache) {
  const base64 = Buffer.from(projectPath).toString('base64');
  const cacheDir = path.join(resolveHomePath('.unvibe'), '.unvibe-cache');
  // ensure cache directory exists
  await fs.mkdir(cacheDir, { recursive: true });
  // save cache to a file named after the base64-encoded project path
  await fs.writeFile(
    path.join(cacheDir, `${base64}.json`),
    JSON.stringify(cache),
    'utf8'
  );
}

export async function parseProject(
  source: string,
  projectDirName: string,
  plugins: ServerPlugin[]
): Promise<Project> {
  const sourcePath = resolveHomePath(source);
  const projectPath = path.join(sourcePath, projectDirName);

  // --- Load file cache, scan for changes, persist cache ---
  const fileCache = await loadCache(projectPath);
  const updatedCache = await scanProjectFilesWithCache(projectPath, fileCache);
  await saveCache(projectPath, updatedCache);

  // Only non-binary, non-empty-content files are included in EXPENSIVE_REFACTOR_LATER_content
  const filesWithContent: Record<string, string> = {};
  for (const [file, entry] of Object.entries(updatedCache)) {
    if (entry.content !== undefined && entry.content !== null) {
      filesWithContent[file] = entry.content;
    }
  }
  const size = Object.values(filesWithContent).join('').length;
  const files = Object.keys(filesWithContent);

  const baseProject: BaseProject = {
    size,
    path: projectPath,
    paths: files,
    plugins: {},
    context_config: {},
    context_preview: [],
    EXPENSIVE_REFACTOR_LATER_content: filesWithContent,
  };

  const tasks: Promise<unknown>[] = [];

  for (const plugin of plugins) {
    tasks.push(
      plugin
        .detect(baseProject)
        .then((result) => {
          if (result) {
            return plugin.setup(baseProject);
          }
        })
        .catch((error) => {
          console.log(`Error in plugin ${plugin.id}:`, error);
        })
    );
  }

  // wait for all plugins to be detected and set up
  await Promise.all(tasks);

  // make a context config object to be configured by the user granularly
  const projectPlugins = plugins.filter((p) => p.id in baseProject.plugins);

  const hooks = projectPlugins
    .map((plugin) => {
      const pluginHooks = plugin.sourceCodeHooks || [];
      return pluginHooks.map((hook) => {
        return {
          id: plugin.id,
          hook,
        };
      });
    })
    .flat();

  const contexts = await Promise.all(
    projectPlugins.map((plugin) =>
      plugin
        .createContext(baseProject)
        .then((ctx) => ({ id: plugin.id, ...ctx }))
    )
  );

  const customSystem = await db.query.customSystemParts.findMany({
    where: (table, { eq }) => eq(table.project_id, projectDirName),
  });

  const flattened = contexts
    .map((ctx) => {
      const tools = Object.values(ctx.tools).map((tool) => {
        const key = `tool/${ctx.id}/${tool.config.name}`;
        return key;
      });

      const custom = customSystem.map((sys) => {
        const key = `system/custom/${sys.key}`;
        return key;
      });

      const systems = Object.keys(ctx.systemParts).map((sysKey) => {
        const key = `system/${ctx.id}/${sysKey}`;
        return key;
      });

      const hooks_config = hooks.map((hook) => {
        const key = `hook/${hook.id}/${hook.hook.name}`;
        return key;
      });

      return [...tools, ...systems, ...custom, ...hooks_config].sort();
    })
    .flat();

  baseProject.context_config = Object.fromEntries(
    flattened.map((key) => [key, true])
  );

  baseProject.context_preview = Object.keys(baseProject.context_config).map(
    (key) => {
      const [type, plugin_id, context_key] = key.split('/');
      let preview_string = '';

      if (type === 'tool') {
        const _value = baseProject.plugins[plugin_id].tools.find(
          (tool) => tool.name === context_key
        );
        preview_string = _value ? _value.description : '';
      } else if (type === 'system') {
        if (plugin_id === 'custom') {
          const customSystemPart = customSystem.find(
            (sys) => sys.key === context_key
          );
          preview_string =
            baseProject.EXPENSIVE_REFACTOR_LATER_content[
              customSystemPart?.value || ''
            ];
        } else {
          const _value = contexts.find((ctx) => ctx.id === plugin_id)
            ?.systemParts[context_key];
          preview_string = _value || '';
        }
      } else if (type === 'hook') {
        const _value = hooks.find((hook) => hook.hook.name === context_key);
        preview_string = _value
          ? [
              _value.hook.operations.diagnostic ? 'diagnostic' : 'transform',
              String(_value.hook.rule),
            ].join('\n')
          : '';
      }

      return {
        key,
        preview_string,
      };
    }
  );

  return baseProject;
}
