import simpleGit from 'simple-git';
import { CreateTool, make } from '@/plugins/_types/tools';
import * as llm from '@/server/llm';

export const config = make({
  name: 'git_merge',
  description: 'Merge a branch into the current branch.',
  usage: '**git_merge**: Merge a branch. Provide branchName.',
  parameters: {
    branchName: { type: 'string', description: 'Branch to merge into current' },
  },
});

export const createTool: CreateTool = function createGitMergeTool({ project }) {
  return llm.tool(
    config.name,
    config.description,
    config.parameters,
    async ({ branchName }) => {
      if (!branchName) return 'branchName required';
      const git = simpleGit(project.path);
      const result = await git.merge([branchName]);
      return `Merge summary:\n${JSON.stringify(result.summary, null, 2)}`;
    }
  );
};
