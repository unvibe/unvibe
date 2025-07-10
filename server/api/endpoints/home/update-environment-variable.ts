import { createEndpoint } from '@/server/api/create-endpoint';
import { z } from 'zod';
import fs from 'node:fs/promises';
import path from 'node:path';

const ENV_PATH = path.resolve(process.cwd(), '.env.local');

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
