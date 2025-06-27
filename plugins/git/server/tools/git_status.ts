import simpleGit from 'simple-git';
import { CreateTool, make } from '@/plugins/_types/tools';
import * as llm from '@/server/llm';

export const config = make({
  name: 'git_status',
  description: 'Show git working directory status.',
  usage: '**git_status**: Show current branch and file changes.',
  parameters: {},
});

export const createTool: CreateTool = function createGitStatusTool({
  project,
}) {
  return llm.tool(
    config.name,
    config.description,
    config.parameters,
    async () => {
      const git = simpleGit(project.path);
      const status = await git.status();
      const lines = [`On branch ${status.current}`];
      status.not_added.forEach((f) => lines.push(`Untracked: ${f}`));
      status.created.forEach((f) => lines.push(`Created: ${f}`));
      status.modified.forEach((f) => lines.push(`Modified: ${f}`));
      status.deleted.forEach((f) => lines.push(`Deleted: ${f}`));
      status.renamed.forEach((r) =>
        lines.push(`Renamed: ${r.from} -> ${r.to}`)
      );
      return lines.length > 1 ? lines.join('\n') : 'Clean working directory.';
    }
  );
};
