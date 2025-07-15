import { createEndpoint } from '@/server/api/create-endpoint';
import * as PluginsMap from '@/plugins/plugins.server';
import { getAll } from '@/server/environment/server';

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
    const env = getAll();
    return Object.entries(env).map(([key, value]) => ({
      key,
      value: value ? '****' : '',
    }));
  } catch (error) {
    console.log('Error fetching environment variables:', error);
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
