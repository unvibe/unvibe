import { ServerPlugin } from '../_types/plugin.server';
import * as tools from './server/tools';
import simpleGit from 'simple-git';
import { id } from './plugin.shared';
import { noop } from '@/lib/core/noop';
import { fetchPage } from './server/api/paginated-issues';

const githubRemotePrefix = 'git@github.com:';

const cache: Record<string, unknown> = {};

export const Plugin: ServerPlugin = {
  metadata: {
    hooks: [],
    tools: Object.keys(tools),
    system: ['github_info'],
  },
  description:
    'Augments GitHub repositories: exposes repo metadata, fetches issues, and enables GitHub-aware actions.',
  id,
  api: {},
  createContext: async () => {
    return {
      tools,
      systemParts: {
        github_info: `This Git repository is connected to Github, \"gh\" CLI is installed, so use that for any Github-related operations.`,
      },
    };
  },
  detect: async (project) => {
    // git & github detection
    const git = simpleGit({
      baseDir: project.path,
      binary: 'git',
      maxConcurrentProcesses: 6,
    });

    const isRepo = await git.checkIsRepo();
    if (!isRepo) return false;
    const remote = await git.getRemotes(true);
    const remoteOrigin = remote.find((r) => r.name === 'origin');
    const remoteRefs = remoteOrigin?.refs;
    const remoteUrl = remoteRefs?.fetch || remoteOrigin?.refs.push;
    const isGithubRepo = Boolean(remoteUrl?.startsWith(githubRemotePrefix));

    return isGithubRepo;
  },
  setup: async (project) => {
    try {
      const git = simpleGit({
        baseDir: project.path,
        binary: 'git',
        maxConcurrentProcesses: 6,
      });
      const remote = await git.getRemotes(true);
      const remoteOrigin = remote.find((r) => r.name === 'origin');
      const remoteRefs = remoteOrigin?.refs;
      const remoteUrl = remoteRefs?.fetch || remoteOrigin?.refs.push;
      const repo = remoteUrl?.replace(githubRemotePrefix, '').slice(0, -4);

      let issues: unknown[] = [];

      if (repo) {
        if (cache[repo]) {
          console.log('Plugin.Github:\t', 'cache hit for repo:', repo);
          issues = cache[repo] as unknown[];
        } else {
          try {
            issues = await fetchPage(
              {
                owner: repo?.split('/')[0] as string,
                repo: repo?.split('/')[1] as string,
                state: 'open',
                perPage: 3,
              },
              project.path
            );
            cache[repo] = issues;
          } catch (error) {
            console.error('Error fetching issues:', error);
            issues = [];
          }
        }
      }

      project.plugins[id] = {
        id,
        tools: Object.values(tools).map((t) => t.config),
        sourceCodeHooks: [],
        info: {
          repo: repo as string,
          issues: JSON.stringify(issues),
        },
      };

      return project;
    } catch (e) {
      noop(e);
      return project;
    }
  },
};
