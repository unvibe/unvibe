import simpleGit from 'simple-git';
import { CreateTool, make } from '@/plugins/_types/tools';
import * as llm from '@/server/llm';

export const config = make({
  name: 'git_rebase',
  description: 'Rebase current branch onto another branch.',
  usage: '**git_rebase**: Rebase onto branch. Provide branchName.',
  parameters: {
    branchName: { type: 'string', description: 'Branch to rebase onto' },
  },
});

export const createTool: CreateTool = function createGitRebaseTool({
  project,
}) {
  return llm.tool(
    config.name,
    config.description,
    config.parameters,
    async ({ branchName }) => {
      if (!branchName) return 'branchName required';
      const git = simpleGit(project.path);
      const output = await git.rebase([branchName]);
      return `Rebase result:\n${output}`;
    }
  );
};
