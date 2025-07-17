import { ServerPlugin } from '../_types/plugin.server';
import * as tools from './server/tools';
import simpleGit from 'simple-git';
import { id } from './plugin.shared';

const githubRemotePrefix = 'git@github.com:';

export const Plugin: ServerPlugin = {
  description:
    'Augments GitHub repositories: exposes repo metadata, fetches issues, and enables GitHub-aware actions.',
  id,
  createContext: async () => {
    return {
      tools,
      systemParts: {
        github_info: `This Git repository is connected to Github, "gh" CLI is installed, so use that for any Github-related operations.`,
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
};
