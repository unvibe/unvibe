import { createEndpoint } from '../create-endpoint';
import { z } from 'zod';
import * as PluginsMap from '@/plugins/plugins.server';
import fs from 'node:fs/promises';
import path from 'node:path';
import { resolveHomePath } from '@/plugins/core/server/api/lib/resolve-home-path';

// List all available plugins (server-side only, not client plugins)
function listAvailablePlugins() {
  return Object.values(PluginsMap).map((plugin) => {
    return {
      id: plugin.Plugin.id,
      // add more plugin metadata from plugin.Plugin if desired
    };
  });
}

// --- THEMES ---
function listAvailableThemes() {
  return [
    { id: 'unvibe-dark', name: 'Unvibe Dark' },
    { id: 'unvibe-light', name: 'Unvibe Light' },
    { id: 'classic', name: 'Classic' },
  ];
}

const ENV_PATH = path.resolve(process.cwd(), '.env.local');

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

async function setEnvironmentVariable(key: string, value: string) {
  let content = '';
  try {
    content = await fs.readFile(ENV_PATH, 'utf-8');
  } catch {
    content = '';
  }
  const lines = content.split('\n');
  let found = false;
  const newLines = lines.map((line) => {
    if (line.startsWith(key + '=')) {
      found = true;
      return `${key}=${value}`;
    }
    return line;
  });
  if (!found) newLines.push(`${key}=${value}`);
  await fs.writeFile(ENV_PATH, newLines.join('\n'), 'utf-8');
  return true;
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

export const updateEnvironmentVariable = createEndpoint({
  type: 'POST',
  pathname: '/home/env-update',
  params: z.object({
    key: z.string(),
    value: z.string(),
  }),
  handler: async ({ parsed }) => {
    await setEnvironmentVariable(parsed.key, parsed.value);
    return { success: true };
  },
});

// --- PROJECT CREATION ENDPOINT ---
import { exec } from 'child_process';
function runShell(cmd: string, cwd?: string): Promise<void> {
  return new Promise((resolve, reject) => {
    exec(cmd, { cwd }, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

export const createProject = createEndpoint({
  type: 'POST',
  pathname: '/home/create-project',
  params: z.object({
    type: z.enum(['empty', 'github']),
    name: z.string(),
    githubRepo: z.string().optional(),
  }),
  handler: async ({ parsed }) => {
    const { type, name, githubRepo } = parsed;
    const safeName = name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const projectPath = resolveHomePath(`projects/${safeName}`);
    if (type === 'empty') {
      await fs.mkdir(projectPath, { recursive: true });
      await fs.writeFile(path.join(projectPath, 'README.md'), `# ${safeName}\n`, 'utf-8');
      return { success: true };
    } else if (type === 'github') {
      if (!githubRepo) return { success: false, error: 'Missing repo' };
      await runShell(`gh repo clone ${githubRepo} ${safeName}`, resolveHomePath('projects'));
      return { success: true };
    }
    return { success: false, error: 'Unknown type' };
  },
});
