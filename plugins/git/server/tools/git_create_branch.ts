import { CreateTool, make } from '@/plugins/_types/tools';
import * as llm from '@/server/llm';
import { gitCreateBranch } from '../api';

export const config = make({
  name: 'git_create_branch',
  description: 'Create and switch to a new Git branch.',
  usage:
    '**git_create_branch**: Create and checkout a new branch. Provide branchName.',
  parameters: {
    branchName: { type: 'string', description: 'Name of the new branch' },
  },
});

export const createTool: CreateTool = function createGitCreateBranchTool({
  project,
}) {
  return llm.tool(
    config.name,
    config.description,
    config.parameters,
    async ({ branchName }) => {
      if (!branchName) return 'branchName required';
      const result = await gitCreateBranch(project, branchName);
      return `Created and switched to branch: ${result}`;
    }
  );
};
