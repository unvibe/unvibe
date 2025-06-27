import { noop } from '@/lib/core/noop';
import { resolveHomePath } from './lib/resolve-home-path';
import { runShellCommand } from './lib/run-shell-command';

async function listLocalSource(rootFromHome: string): Promise<string[]> {
  try {
    const rootPath = resolveHomePath(rootFromHome);
    // Use ls -t to order by last modified (descending)
    const result = await runShellCommand('ls -t', {
      cwd: rootPath,
    });
    return result.split('\n').filter((line) => line.trim() !== '');
  } catch (error) {
    noop(error);
    return [];
  }
}

export async function listLocal(
  _sources: string[]
): Promise<Record<string, string[]>> {
  // normalize for duplicates
  const sources = Array.from(new Set(_sources));
  // accumulate results
  const result: Record<string, string[]> = {};

  // collect all projects
  await Promise.all(
    sources.map(async (source) => {
      const projects = await listLocalSource(source);
      result[source] = projects;
    })
  );

  return result;
}
