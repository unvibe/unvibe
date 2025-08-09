import { BaseProject, Project } from '@/server/project/types';
import { resolveHomePath } from './utils';
import path from 'node:path';
import type { ServerPlugin } from '@/plugins/_types/plugin.server';
import { db } from '@/server/db';
import { scanProjectFilesWithCache } from './scan-and-cache';
import type { FileCache } from './cache';
import fs from 'node:fs/promises';
import { pathFromId } from '.';

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
// async function loadDerivedCache(
//   projectPath: string
// ): Promise<Partial<Project> | null> {
//   const base64 = Buffer.from(projectPath).toString('base64');
//   await fs.mkdir(CACHE_DIR, { recursive: true });
//   const cachePath = path.join(CACHE_DIR, `${base64}.derived.json`);
//   try {
//     const content = await fs.readFile(cachePath, 'utf8');
//     return JSON.parse(content);
//   } catch {
//     return null;
//   }
// }

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

export async function parseProject(
  id: string,
  plugins: ServerPlugin[]
): Promise<Project> {
  const projectPathFromHome = pathFromId(id);
  const projectPath = resolveHomePath(projectPathFromHome);

  // --- Stale-while-revalidate: serve cache, revalidate in background ---
  const fileCache = await loadCache(projectPath);
  let _files = fileCache;
  const cacheIsMissing = Object.keys(_files).length === 0;

  if (cacheIsMissing) {
    // No cache? Block and scan for correctness
    _files = await scanProjectFilesWithCache(projectPath, fileCache);
    await saveCache(projectPath, _files);
  } else {
    // Fire-and-forget: update cache in the background for next time
    scanProjectFilesWithCache(projectPath, fileCache).then(async (fresh) => {
      await saveCache(projectPath, fresh);
    });
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
    registeredStructuredOutput: [],
    UIEntryPoints: {},
    EXPENSIVE_REFACTOR_LATER_content: filesWithContent,
  };

  const tasks: Promise<unknown>[] = [];
  for (const plugin of plugins) {
    tasks.push(
      plugin
        .detect(baseProject)
        .then((result) => {
          if (result) {
            const old = baseProject.plugins[plugin.id]?.info;
            baseProject.plugins[plugin.id] = {
              id: plugin.id,
              info: {
                description: plugin.description,
                ...old,
              },
              tools: [],
              sourceCodeHooks: [],
            };
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
      plugin.createContext(baseProject).then((ctx) => {
        const old = baseProject.plugins[plugin.id].info;
        baseProject.plugins[plugin.id] = {
          id: plugin.id,
          info: {
            description: plugin.description,
            ...old,
          },
          sourceCodeHooks:
            plugin.sourceCodeHooks?.map((hook) => ({
              name: hook.name,
              rule: hook.rule.source,
              operations: {
                diagnostic: Boolean(hook.operations.diagnostic),
                trasnform: Boolean(hook.operations.transform),
              },
            })) || [],
          tools: Object.values(ctx.tools).map((tool) => ({
            name: tool.config.name,
            description: tool.config.description,
            parameters: tool.config.parameters,
            usage: tool.config.usage,
          })),
        };

        const so = ctx.structuredOutput;

        if (so && so.length > 0) {
          baseProject.registeredStructuredOutput.push(
            ...so.map((entry) => ({
              key: entry.key,
              description: entry.description,
              resolve: entry.resolveFiles,
              apply: entry.apply,
              resolvable: typeof entry.resolveFiles === 'function',
              applyable: typeof entry.apply === 'function',
            }))
          );
        }
        return { id: plugin.id, ...ctx };
      })
    )
  );

  const customSystem = await db.query.customSystemParts.findMany({
    where: (table, { eq }) => eq(table.project_id, id),
  });

  const flattened = contexts
    .map((ctx) => {
      const tools = Object.values(ctx.tools).map((tool) => {
        const key = `tool/${ctx.id}/${tool.config.name}`;
        return key;
      });
      const structuredOutput =
        ctx.structuredOutput?.map((so) => {
          const key = `structured_output/${ctx.id}/${so.key}`;
          return key;
        }) || [];
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
      return [
        ...tools,
        ...systems,
        ...custom,
        ...hooks_config,
        ...structuredOutput,
      ].sort();
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
      } else if (type === 'structured_output') {
        const _value = baseProject.registeredStructuredOutput.find(
          (so) => so.key === context_key
        );
        preview_string = _value ? _value.description : '';
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
