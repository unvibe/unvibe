import { z } from 'zod';
import { createEndpoint } from '../../create-endpoint';
import { noop } from '@/lib/core/noop';
import { resolveHomePath } from '@/server/project/utils';
import { runShellCommand } from '@/lib/server/run-shell-command';

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

async function _listLocal(
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

export const listProjects = createEndpoint({
  type: 'GET',
  pathname: '/projects/list',
  params: z.object({
    sources: z.string(),
  }),
  handler: async ({ parsed }) => {
    const { sources } = parsed;

    // from the ~ comma seperated list of directories that are a root of a project
    const projects = await _listLocal(sources.split(','));

    return {
      projects,
    };
  },
});
