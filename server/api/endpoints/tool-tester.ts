import { createEndpoint } from '../create-endpoint';
import { z } from 'zod';
import * as PluginsMap from '@/plugins/plugins.server';
import { parseProject } from '@/server/project/parse';
import { Project } from '@/plugins/core/server/api/lib/project';

const allPlugins = Object.values(PluginsMap).map((plugin) => plugin.Plugin);

async function loadPlugins(project: Project) {
  return await Promise.all(
    Object.values(PluginsMap).filter((plugin) =>
      Object.keys(project.plugins).includes(plugin.Plugin.id)
    )
  );
}

export const callTool = createEndpoint({
  type: 'POST',
  pathname: '/tools-tester/call',
  params: z.object({
    tool: z.string(),
    args: z.record(z.unknown()),
    projectDirname: z.string(),
    source: z.string(),
  }),
  handler: async ({ parsed }) => {
    const { tool, args, source, projectDirname } = parsed;
    const project = await parseProject(source, projectDirname, allPlugins);

    const plugins = await loadPlugins(project);
    const pluginsContexts = await Promise.all(
      plugins.map((plugin) => plugin.Plugin.createContext(project))
    );
    // Collect tool info along with plugin id
    const pluginsWithTools = pluginsContexts
      .map((pContext, idx) => {
        const plugin = plugins[idx];
        const tools = Object.values(pContext.tools);
        return tools.map((tool) => ({
          toolMod: tool,
          pluginName: plugin.Plugin.id,
        }));
      })
      .flat();

    const target = pluginsWithTools.find(
      (entry) => entry.toolMod.config.name === tool
    );

    if (!target) {
      return {
        error: 'Tool not found',
      };
    }

    const callToolFn = target.toolMod.createTool({
      project,
    }).fn;

    const result = await callToolFn(args);

    return {
      result,
      pluginName: target.pluginName,
      toolName: tool,
    };
  },
});

export const listTools = createEndpoint({
  type: 'GET',
  pathname: '/tools-tester/list',
  params: z.object({
    projectDirname: z.string(),
    source: z.string(),
  }),
  handler: async ({ parsed }) => {
    const { projectDirname, source } = parsed;
    const project = await parseProject(source, projectDirname, allPlugins);
    const plugins = await loadPlugins(project);
    const pluginsContexts = await Promise.all(
      plugins.map((plugin) => plugin.Plugin.createContext(project))
    );

    // Each tool now includes pluginName
    const pluginTools = pluginsContexts
      .map((c, idx) => {
        const plugin = plugins[idx];
        return Object.values(c.tools || {}).map((t) => ({
          ...t.config,
          pluginName: plugin.Plugin.id,
        }));
      })
      .flat();

    return {
      tools: pluginTools,
    };
  },
});
