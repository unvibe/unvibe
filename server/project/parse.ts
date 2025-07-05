import { BaseProject, Project } from '@/server/project/types';
import { walk } from './walk';
import { resolveHomePath } from './utils';
import path from 'node:path';
import type { ServerPlugin } from '@/plugins/_types/plugin.server';
import { db } from '@/server/db';

export const cache: Record<string, Record<string, string>> = {};

async function getFiles(projectPath: string) {
  if (cache[projectPath]) {
    console.log('Plugin.Core:\t', 'Using cached files');
    return cache[projectPath];
  }

  const filesWithContent = await walk(projectPath);

  cache[projectPath] = filesWithContent;

  return filesWithContent;
}

export async function parseProject(
  source: string,
  projectDirName: string,
  plugins: ServerPlugin[]
): Promise<Project> {
  const sourcePath = resolveHomePath(source);
  const projectPath = path.join(sourcePath, projectDirName);
  const filesWithContent = await getFiles(projectPath);
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
