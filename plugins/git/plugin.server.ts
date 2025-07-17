import { ServerPlugin } from '../_types/plugin.server';
import simpleGit from 'simple-git';
import { id } from './plugin.shared';

const cache: Record<string, boolean> = {};

export const Plugin: ServerPlugin = {
  description:
    'Detects Git repositories, exposes branch and repo metadata, and enables Git-aware automations.',
  id,
  createContext: async (baseProject) => {
    const currentBranch = await simpleGit({
      baseDir: baseProject.path,
      binary: 'git',
      maxConcurrentProcesses: 6,
    })
      .branchLocal()
      .then((branch) => branch.current);
    return {
      tools: {},
      systemParts: {
        git_info: `Git is installed on this system and the project is a Git repository. current branch is: ${currentBranch}`,
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
};
