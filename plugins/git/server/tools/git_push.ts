import { CreateTool, make } from '@/plugins/_types/tools';
import * as llm from '@/server/llm';
import { gitPush } from '../api';

export const config = make({
  name: 'git_push',
  description: 'Push local commits to a remote branch.',
  usage:
    '**git_push**: Push changes to remote (optionally specify remote and branch).',
  parameters: {
    remote: {
      type: 'string',
      description: 'Remote name (default: origin)',
      nullable: true,
    },
    branch: {
      type: 'string',
      description: 'Branch name (default: current branch)',
      nullable: true,
    },
  },
});

export const createTool: CreateTool = function createGitPushTool({ project }) {
  return llm.tool(
    config.name,
    config.description,
    config.parameters,
    async ({ remote, branch }) => {
      const result = gitPush(project, remote || 'origin', branch);
      return result;
    }
  );
};
