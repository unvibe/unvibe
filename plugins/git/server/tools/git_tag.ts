import simpleGit from 'simple-git';
import { CreateTool, make } from '@/plugins/_types/tools';
import * as llm from '@/server/llm';

export const config = make({
  name: 'git_tag',
  description: 'Create a git tag.',
  usage: '**git_tag**: Create a tag. Provide tagName and optional message.',
  parameters: {
    tagName: { type: 'string', description: 'Name of the tag to create' },
    message: { type: 'string', description: 'Tag message', nullable: true },
  },
});

export const createTool: CreateTool = function createGitTagTool({ project }) {
  return llm.tool(
    config.name,
    config.description,
    config.parameters,
    async ({ tagName, message }) => {
      if (!tagName) return 'tagName required';
      const git = simpleGit(project.path);
      if (message) {
        await git.addAnnotatedTag(tagName, message);
      } else {
        await git.addTag(tagName);
      }
      return `Tag ${tagName} created${message ? ' with message: ' + message : ''}.`;
    }
  );
};
