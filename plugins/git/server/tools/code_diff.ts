import simpleGit from 'simple-git';
import { CreateTool, make } from '@/plugins/_types/tools';
import * as llm from '@/server/llm';

export const config = make({
  name: 'code_diff',
  description:
    'Show unstaged/staged changes or diff for recent commits. Optionally, diff against a specified branch. Returns file paths, change type, and short diff snippets.',
  usage: `\ncode_diff\nView code diffs in the codebase. Modes: unstaged, staged, or commit diffs. Optionally, specify a remote/local branch to diff against.`,
  parameters: {
    mode: {
      type: 'string',
      enum: ['unstaged', 'staged', 'commits', 'branch'],
      description: 'Show unstaged, staged, commit, or branch diffs',
      nullable: true,
    },
    commitCount: {
      type: 'number',
      description:
        'Number of recent commits to show diff for (if mode is commits)',
      nullable: true,
    },
    againstBranch: {
      type: 'string',
      description: 'Branch name to diff against (if mode is branch)',
      nullable: true,
    },
  },
});

export const createTool: CreateTool = function createCodeDiffTool({ project }) {
  return llm.tool(
    config.name,
    config.description,
    config.parameters,
    async ({ mode = 'unstaged', commitCount = 1, againstBranch }) => {
      const git = simpleGit(project.path);
      let diffOutput = '';
      if (mode === 'unstaged') {
        diffOutput = await git.diff();
      } else if (mode === 'staged') {
        diffOutput = await git.diff(['--cached']);
      } else if (mode === 'commits') {
        diffOutput = await git.diff([`HEAD~${commitCount}`, 'HEAD']);
      } else if (mode === 'branch' && againstBranch) {
        diffOutput = await git.diff([againstBranch]);
      }
      // Split by file and only deliver short context for each
      const fileDiffs: { file: string; snippet: string }[] = [];
      const fileSeparator = /^diff --git a\/(.+?) b\/(.+)$/gm;
      let match: RegExpExecArray | null;
      let prevIndex = 0,
        prevFile = '';
      while ((match = fileSeparator.exec(diffOutput))) {
        if (prevFile) {
          const snippet = diffOutput.slice(prevIndex, match.index).trim();
          fileDiffs.push({ file: prevFile, snippet: snippet.slice(0, 600) });
        }
        prevFile = match[2];
        prevIndex = match.index;
      }
      // Capture last file
      if (prevFile && prevIndex < diffOutput.length) {
        const snippet = diffOutput.slice(prevIndex).trim();
        fileDiffs.push({ file: prevFile, snippet: snippet.slice(0, 600) });
      }
      return fileDiffs.length > 0
        ? fileDiffs
        : [{ file: 'NONE', snippet: 'No changes detected.' }];
    }
  );
};
