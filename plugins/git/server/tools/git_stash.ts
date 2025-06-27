import simpleGit, { SimpleGit } from 'simple-git';
import { CreateTool, make } from '@/plugins/_types/tools';
import * as llm from '@/server/llm';

export const config = make({
  name: 'git_stash',
  description: 'Stash or apply stashed changes.',
  usage:
    '**git_stash**: Stash some changes or pop/list them. Provide action and optional message.',
  parameters: {
    action: {
      type: 'string',
      enum: ['save', 'pop', 'list'],
      description: 'Action to perform',
      nullable: false,
    },
    message: {
      type: 'string',
      description: 'Optional message for stash',
      nullable: true,
    },
  },
});

export const createTool: CreateTool = function createGitStashTool({ project }) {
  return llm.tool(
    config.name,
    config.description,
    config.parameters,
    async ({ action, message }) => {
      const git: SimpleGit = simpleGit(project.path);
      if (action === 'save') {
        const result = await git.stash(['save', message || '']);
        return `Stashed changes:\n${result}`;
      } else if (action === 'pop') {
        const result = await git.stash(['pop']);
        return `Popped stash:\n${result}`;
      } else if (action === 'list') {
        const list = await git.stashList();
        return list.all.map((s) => `${s.hash}: ${s.message}`).join('\n');
      }
      return 'Invalid action. Use save, pop, or list.';
    }
  );
};
