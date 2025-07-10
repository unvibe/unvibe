import { createEndpoint } from '../create-endpoint';
import { z } from 'zod';
import * as PluginsMap from '@/plugins/plugins.server';
import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import stripAnsi from 'strip-ansi';
import os from 'node:os';
import { runShellCommand } from '@/lib/server/run-shell-command';
import { noop } from '@/lib/core/noop';

// Configurable projects dir, defaults to '~/projects' if not set
function getProjectsDir() {
  const envDir = process.env.UNVIBE_PROJECTS_DIR;
  if (envDir && envDir.trim()) {
    return envDir.startsWith('~')
      ? path.join(os.homedir(), envDir.slice(1))
      : envDir;
  }
  return path.join(os.homedir(), 'projects');
}

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
    const { key, value } = parsed;
    await setEnvironmentVariable(key, value);
    return { success: true };
  },
});

export const runHomeSyncUpdate = createEndpoint({
  type: 'POST',
  pathname: '/home/sync-update',
  handler: async () => {
    return await new Promise<{
      status: 'updating' | 'done' | 'error';
      logs: string;
    }>((resolve) => {
      let logs = '';
      let status: 'updating' | 'done' | 'error' = 'updating';
      const proc = spawn('node', ['cli.ts', '--update'], { shell: true });
      proc.stdout.on('data', (data) => {
        logs += stripAnsi(data.toString());
      });
      proc.stderr.on('data', (data) => {
        logs += stripAnsi(data.toString());
      });
      proc.on('close', (code) => {
        status = code === 0 ? 'done' : 'error';
        resolve({ status, logs });
      });
      proc.on('error', (err) => {
        status = 'error';
        resolve({ status, logs: logs + '\n' + stripAnsi(err.toString()) });
      });
    });
  },
});

export const createProject = createEndpoint({
  type: 'POST',
  pathname: '/home/create-project',
  params: z.object({
    mode: z.enum(['empty', 'github']),
    name: z.string().min(1),
    githubRepo: z.string().optional(),
  }),
  handler: async ({ parsed }) => {
    const { mode, name, githubRepo } = parsed;
    const projectsDir = getProjectsDir();
    const targetDir = path.join(projectsDir, name);

    // Validate project name (very basic)
    if (!/^[a-zA-Z0-9_.-]+$/.test(name)) {
      return { success: false, error: 'Invalid project name.' };
    }

    // Check if already exists
    try {
      await fs.access(targetDir);
      return { success: false, error: 'Project already exists.' };
    } catch {
      noop();
    }

    if (mode === 'empty') {
      await fs.mkdir(targetDir, { recursive: true });
      return { success: true };
    } else if (mode === 'github') {
      if (!githubRepo || !/^https?:\/\/.+\.git$/.test(githubRepo)) {
        return {
          success: false,
          error: 'Please provide a valid GitHub repo URL ending with .git.',
        };
      }
      try {
        await runShellCommand(`gh repo clone ${githubRepo} "${targetDir}"`);
      } catch (err) {
        // If the error is only benign git/gh stderr, check if the folder exists
        try {
          await fs.access(targetDir);
          // The clone succeeded despite the stderr (benign output)
          return { success: true, note: 'stderr: ' + String(err) };
        } catch {
          return {
            success: false,
            error: err?.toString() || 'Failed to clone repo',
          };
        }
      }
      return { success: true };
    }
    return { success: false, error: 'Unknown mode.' };
  },
});
