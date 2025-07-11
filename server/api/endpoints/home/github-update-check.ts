import { createEndpoint } from '@/server/api/create-endpoint';
import { execSync } from 'node:child_process';

/**
 * GET /home/github-update-check
 * Checks if the local git repository is behind the remote (origin) branch.
 * Only reads state; does NOT modify the repository.
 */

export const githubUpdateCheck = createEndpoint({
  type: 'GET',
  pathname: '/home/github-update-check',
  async handler() {
    try {
      // Step 1: Ensure we are in a git repo with an origin remote
      let branch = '';
      let originUrl = '';
      try {
        branch = execSync('git rev-parse --abbrev-ref HEAD', {
          encoding: 'utf8',
        }).trim();
        originUrl = execSync('git remote get-url origin', {
          encoding: 'utf8',
        }).trim();
      } catch {
        return {
          isGitRepo: false,
          reason: 'Not a git repository or no origin remote.',
        };
      }

      // Only check for GitHub remote (optional)
      if (!originUrl.includes('github.com')) {
        return { isGitRepo: false, reason: 'Origin remote is not GitHub.' };
      }

      // Step 2: Fetch latest refs (safe, no merge)
      try {
        execSync('git fetch origin', { encoding: 'utf8' });
      } catch {
        return { isGitRepo: false, reason: 'Failed to fetch origin.' };
      }

      // Step 3: Compare commits
      const localHead = execSync('git rev-parse HEAD', {
        encoding: 'utf8',
      }).trim();
      let remoteHead = '';
      try {
        remoteHead = execSync(`git rev-parse origin/${branch}`, {
          encoding: 'utf8',
        }).trim();
      } catch {
        return {
          isGitRepo: true,
          isBehind: false,
          reason: `No matching branch 'origin/${branch}' found.`,
        };
      }

      if (localHead === remoteHead) {
        return {
          isGitRepo: true,
          isBehind: false,
          behindBy: 0,
          commits: [],
          branch,
          localHead,
          remoteHead,
        };
      }

      // Step 4: Get list of commits behind
      let commitList: { hash: string; summary: string }[] = [];
      let behindBy = 0;
      try {
        const log = execSync(`git log HEAD..origin/${branch} --oneline`, {
          encoding: 'utf8',
        })
          .trim()
          .split('\n')
          .filter(Boolean);
        behindBy = log.length;
        commitList = log.map((line) => {
          const [hash, ...rest] = line.split(' ');
          return { hash, summary: rest.join(' ') };
        });
      } catch {
        // If log fails, still show basic info
      }
      return {
        isGitRepo: true,
        isBehind: true,
        behindBy,
        commits: commitList,
        branch,
        localHead,
        remoteHead,
      };
    } catch (err: unknown) {
      return {
        error: 'Unexpected error',
        details: err instanceof Error ? err.message : String(err),
      };
    }
  },
});
