import { BaseProject, Project } from '@/server/project/types';
import { resolveHomePath } from './utils';
import path from 'node:path';
import type { ServerPlugin } from '@/plugins/_types/plugin.server';
import { db } from '@/server/db';
import { scanProjectFilesWithCache } from './scan-and-cache';
import type { FileCache } from './cache';
import fs from 'node:fs/promises';

const CACHE_DIR = path.join(resolveHomePath('.unvibe'), '.unvibe-cache');

// Load and persist cache for each project directory
async function loadCache(projectPath: string): Promise<FileCache> {
  const base64 = Buffer.from(projectPath).toString('base64');
  await fs.mkdir(CACHE_DIR, { recursive: true });
  const cachePath = path.join(CACHE_DIR, `${base64}.json`);
  try {
    const content = await fs.readFile(cachePath, 'utf8');
    return JSON.parse(content);
  } catch {
    return {};
  }
}

async function saveCache(projectPath: string, cache: FileCache) {
  const base64 = Buffer.from(projectPath).toString('base64');
  await fs.mkdir(CACHE_DIR, { recursive: true });
  await fs.writeFile(
    path.join(CACHE_DIR, `${base64}.json`),
    JSON.stringify(cache),
    'utf8'
  );
}

// Derived-data cache helpers
async function loadDerivedCache(
  projectPath: string
): Promise<Partial<Project> | null> {
  const base64 = Buffer.from(projectPath).toString('base64');
  await fs.mkdir(CACHE_DIR, { recursive: true });
  const cachePath = path.join(CACHE_DIR, `${base64}.derived.json`);
  try {
    const content = await fs.readFile(cachePath, 'utf8');
    return JSON.parse(content);
  } catch {
    return null;
  }
}

async function saveDerivedCache(
  projectPath: string,
  derived: Partial<Project>
) {
  const base64 = Buffer.from(projectPath).toString('base64');
  await fs.mkdir(CACHE_DIR, { recursive: true });
  await fs.writeFile(
    path.join(CACHE_DIR, `${base64}.derived.json`),
    JSON.stringify(derived),
    'utf8'
  );
}

async function eagerShouldReturnCache(projectPath: string) {
  const DIR_CACHE_NAME = 'roots.json';
  try {
    const roots = await fs.readFile(path.join(CACHE_DIR, DIR_CACHE_NAME), {
      encoding: 'utf8',
    });
    const json = roots ? JSON.parse(roots) : {};
    const stat = await fs.stat(projectPath).catch(() => null);
    if (!stat) {
      return false;
    }
    if (json[projectPath] === stat.mtimeMs) {
      return true;
    }
  } catch {
    return false;
  }
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
  const isUnchanged = await eagerShouldReturnCache(projectPath);
  let _files: FileCache;
  let derived: Partial<Project> | null = null;

  if (isUnchanged) {
    _files = fileCache;
    derived = await loadDerivedCache(projectPath);
    if (derived && derived.context_config && derived.context_preview) {
      // Only the DB-dependent part (customSystem) must be fresh
      const customSystem = await db.query.customSystemParts.findMany({
        where: (table, { eq }) => eq(table.project_id, projectDirName),
      });
      // Patch context_preview for 'system/custom/*' entries
      const context_preview = derived.context_preview.map((entry) => {
        if (entry.key.startsWith('system/custom/')) {
          const context_key = entry.key.split('/')[2];
          const customSystemPart = customSystem.find(
            (sys) => sys.key === context_key
          );
          let preview_string = '';
          if (customSystemPart) {
            preview_string = _files[customSystemPart.value]?.content || '';
          }
          return { ...entry, preview_string };
        } else {
          return entry;
        }
      });
      return {
        ...derived,
        context_preview,
        EXPENSIVE_REFACTOR_LATER_content:
          derived.EXPENSIVE_REFACTOR_LATER_content || {},
        // These are always fresh:
        path: projectPath,
        size: derived.size || 0,
        plugins: derived.plugins || {},
        context_config: derived.context_config || {},
      } as Project;
    }
  } else {
    _files = await scanProjectFilesWithCache(projectPath, fileCache);
    await saveCache(projectPath, _files);
  }

  // Compute everything that would be cached (derived)
  const filesWithContent: Record<string, string> = {};
  for (const [file, entry] of Object.entries(_files)) {
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
  await Promise.all(tasks);

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
        const _value = baseProject.plugins[plugin_id]?.tools?.find(
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

  // Save derived cache (excluding DB-dependent customSystem)
  await saveDerivedCache(projectPath, {
    size: baseProject.size,
    paths: baseProject.paths,
    plugins: baseProject.plugins,
    context_config: baseProject.context_config,
    context_preview: baseProject.context_preview,
    EXPENSIVE_REFACTOR_LATER_content:
      baseProject.EXPENSIVE_REFACTOR_LATER_content,
  });

  return baseProject;
}
