import { createEndpoint } from '@/server/api/create-endpoint';
import * as PluginsMap from '@/plugins/plugins.server';
import fs from 'node:fs/promises';
import { ENV_PATH } from './utils';

// List all available plugins (server-side only, not client plugins)
function listAvailablePlugins() {
  return Object.values(PluginsMap).map((plugin) => {
    const p = plugin.Plugin;
    return {
      id: p.id,
      metadata: p.metadata,
      description: p.description,
    };
  });
}

function listAvailableThemes() {
  return [
    { id: 'unvibe-dark', name: 'Unvibe Dark' },
    { id: 'unvibe-light', name: 'Unvibe Light' },
    { id: 'classic', name: 'Classic' },
  ];
}

async function getEnvironmentVariables() {
  try {
    const content = await fs.readFile(ENV_PATH, 'utf-8');
    return content
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#'))
      .map((line) => {
        const [key, ...rest] = line.split('=');
        return { key, value: rest.join('=') };
      });
  } catch {
    return [];
  }
}

export const getHomeInfo = createEndpoint({
  type: 'GET',
  pathname: '/home/info',
  handler: async () => {
    const plugins = listAvailablePlugins();
    const themes = listAvailableThemes();
    const env = await getEnvironmentVariables();
    return { plugins, themes, env };
  },
});
