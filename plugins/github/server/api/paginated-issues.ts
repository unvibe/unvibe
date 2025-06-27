// gh-issues.ts
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const exec = promisify(execFile);

interface IssueQuery {
  owner: string; // e.g. "vercel"
  repo: string; // e.g. "next.js"
  perPage?: number; // 1-100  (GitHub REST limit)
  state?: 'open' | 'closed' | 'all';
}

export async function fetchPage(
  { perPage = 100, state = 'open' }: IssueQuery,
  projectPath: string
) {
  // gh api returns raw JSON; we add `-f` form params for pagination
  const { stdout } = await exec(
    'gh',
    [
      'issue',
      'list',
      '--json',
      'title,body,createdAt,updatedAt,number,assignees',
      '--limit',
      perPage.toString(),
      '--state',
      state,
    ],
    { maxBuffer: 1024 * 1024 * 10, cwd: projectPath } // 10 MB buffer just in case
  );
  return JSON.parse(stdout) as Array<Record<string, unknown>>;
}
