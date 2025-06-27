import simpleGit from 'simple-git';
import { CreateTool, make } from '@/plugins/_types/tools';
import * as llm from '@/server/llm';

export const config = make({
  name: 'git_log',
  description: 'Show recent commit logs.',
  usage: '**git_log**: Show logs. Provide count (optional).',
  parameters: {
    count: {
      type: 'number',
      description: 'Number of commits to show',
      nullable: true,
    },
  },
});

export const createTool: CreateTool = function createGitLogTool({ project }) {
  return llm.tool(
    config.name,
    config.description,
    config.parameters,
    async ({ count = 10 }) => {
      const git = simpleGit(project.path);
      const log = await git.log({ n: count });
      return log.all.map((e) => `${e.hash} ${e.message}`).join('\n');
    }
  );
};
