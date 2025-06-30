import { Project } from '@/plugins/core/server/api/lib/project';
import * as PluginsMap from '@/plugins/plugins.server';
import {
  SourceCodeHook,
  SourceCodeTransformHook,
  VirtualFile,
} from '@/plugins/_types/plugin.server';

export async function loadPlugins(project: Project) {
  return await Promise.all(
    Object.values(PluginsMap).filter((plugin) =>
      Object.keys(project.plugins).includes(plugin.Plugin.id)
    )
  );
}

export async function runTransforms(
  project: Project,
  files: { path: string; content: string }[]
) {
  const plugins = await loadPlugins(project);

  const transformHooks = plugins
    .map((plugin) => plugin.Plugin.sourceCodeHooks)
    .filter((hook): hook is SourceCodeHook[] => !!hook)
    .flat()
    .filter((hook): hook is SourceCodeTransformHook =>
      Boolean(hook.operations.transform)
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
