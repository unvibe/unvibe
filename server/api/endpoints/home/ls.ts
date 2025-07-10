import { createEndpoint } from '../../create-endpoint';
import { z } from 'zod';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { noop } from '@/lib/core/noop';

function getSafePath(inputPath?: string) {
  // Only allow traversal within the user's home directory
  const home = os.homedir();
  const resolved = inputPath
    ? path.resolve(home, inputPath.replace(/^~\/?/, ''))
    : home;
  if (!resolved.startsWith(home)) {
    throw new Error('Path escapes home directory');
  }
  return resolved;
}

export const listDir = createEndpoint({
  type: 'POST',
  pathname: '/home/ls',
  params: z.object({
    path: z.string().optional(),
  }),
  handler: async ({ parsed }) => {
    let resolved;
    try {
      resolved = getSafePath(parsed.path);
    } catch (err) {
      noop(err);
      return { success: false, error: 'Invalid path' };
    }
    try {
      const entries = await fs.readdir(resolved, { withFileTypes: true });
      const files = entries
        .filter((ent) => !ent.name.startsWith('.'))
        .map((ent) => ({
          name: ent.name,
          type: ent.isDirectory() ? 'dir' : 'file',
        }));
      return { success: true, files, abs: resolved };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  },
});
