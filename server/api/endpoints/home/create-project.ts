import { createEndpoint } from '@/server/api/create-endpoint';
import { z } from 'zod';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { runShellCommand } from '@/lib/server/run-shell-command';
import { noop } from '@/lib/core/noop';

function getTargetDir(name: string, source?: string) {
  const homeDir = os.homedir();
  if (source && source.trim()) {
    // always treat source as relative to home
    const src = source.replace(/^~\/?/, '');
    return path.join(homeDir, src, name);
  }
  return path.join(homeDir, 'projects', name);
}

export const createProject = createEndpoint({
  type: 'POST',
  pathname: '/home/create-project',
  params: z.object({
    mode: z.enum(['empty', 'github']),
    name: z.string().min(1),
    githubRepo: z.string().optional(),
    source: z.string().optional(),
  }),
  handler: async ({ parsed }) => {
    const { mode, name, githubRepo, source } = parsed;
    const targetDir = getTargetDir(name, source);

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
