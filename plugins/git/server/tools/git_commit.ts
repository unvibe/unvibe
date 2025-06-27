import { CreateTool, make } from '@/plugins/_types/tools';
import * as llm from '@/server/llm';
import { gitCommit } from '../api';

export const config = make({
  name: 'git_commit',
  description: 'Commit staged (or all) changes to git with a message.',
  usage: '**git_commit**: Commit changes. Provide a commit message.',
  parameters: {
    message: { type: 'string', description: 'Commit message' },
  },
});

export const createTool: CreateTool = function createGitCommitTool({
  project,
}) {
  return llm.tool(
    config.name,
    config.description,
    config.parameters,
    async ({ message }) => {
      if (!message) return 'Commit message required.';
      const result = await gitCommit(project, message);
      return `Committed: ${result}`;
    }
  );
};
