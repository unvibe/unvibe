import simpleGit from 'simple-git';
import { CreateTool, make } from '@/plugins/_types/tools';
import * as llm from '@/server/llm';

export const config = make({
  name: 'git_checkout',
  description: 'Checkout to a specified branch or revision.',
  usage:
    '**git_checkout**: Checkout to a branch or commit. Provide branchName.',
  parameters: {
    branchName: {
      type: 'string',
      description: 'Branch or revision to checkout',
    },
  },
});

export const createTool: CreateTool = function createGitCheckoutTool({
  project,
}) {
  return llm.tool(
    config.name,
    config.description,
    config.parameters,
    async ({ branchName }) => {
      if (!branchName) return 'branchName required';
      const git = simpleGit(project.path);
      await git.checkout(branchName);
      return `Checked out to ${branchName}`;
    }
  );
};
