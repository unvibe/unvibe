import { ServerPlugin } from '../_types/plugin.server';
// import * as tools from './server/tools';
import * as api from './server/api';
import simpleGit from 'simple-git';
import { id } from './plugin.shared';
import { noop } from '@/lib/core/noop';

const githubRemotePrefix = 'git@github.com:';

const cache: Record<string, boolean> = {};

export const Plugin: ServerPlugin<typeof api> = {
  id,
  api,
  createContext: async (baseProject) => {
    return {
      tools: {},
      systemParts: {
        git_info: `Git is installed on this system and the project is a Git repository. current branch is: ${baseProject.plugins[id].info.currentBranch}`,
      },
    };
  },
  detect: async (project) => {
    if (cache[project.path]) {
      console.log('Plugin.Git:\t', 'cache hit', project.path);
      return cache[project.path];
    }
    // git & github detection
    const git = simpleGit({
      baseDir: project.path,
      binary: 'git',
      maxConcurrentProcesses: 6,
    });

    const isGitRepo = await git.checkIsRepo();
    cache[project.path] = isGitRepo;

    return isGitRepo;
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
      const isGithubRepo = Boolean(remoteUrl?.startsWith(githubRemotePrefix));
      const repo = remoteUrl?.replace(githubRemotePrefix, '').slice(0, -4);
      const branchSummary = await git.branch();
      const branches = branchSummary.all;
      const currentBranch = branchSummary.current;

      project.plugins[id] = {
        id,
        // tools: Object.values(tools).map((t) => t.config),
        tools: [],
        sourceCodeHooks: [],
        info: {
          currentBranch,
          branches: branches.join(','),
        },
      };

      if (isGithubRepo && repo) {
        project.plugins[id].info.github_repo = repo;
      }

      return project;
    } catch (e) {
      noop(e);
      return project;
    }
  },
};
