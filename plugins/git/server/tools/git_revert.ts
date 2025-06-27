import simpleGit from 'simple-git';
import { CreateTool, make } from '@/plugins/_types/tools';
import * as llm from '@/server/llm';

export const config = make({
  name: 'git_revert',
  description: 'Revert a commit.',
  usage: '**git_revert**: Revert a commit. Provide commitHash.',
  parameters: {
    commitHash: { type: 'string', description: 'Commit hash to revert' },
  },
});

export const createTool: CreateTool = function createGitRevertTool({
  project,
}) {
  return llm.tool(
    config.name,
    config.description,
    config.parameters,
    async ({ commitHash }) => {
      if (!commitHash) return 'commitHash required';
      const git = simpleGit(project.path);
      await git.revert(commitHash);
      return `Reverted commit ${commitHash}.`;
    }
  );
};
