import { exec } from 'child_process';
import { promisify } from 'util';
import { CreateTool, make } from '@/plugins/_types/tools';
import * as llm from '@/server/llm';

const asyncExec = promisify(exec);
const MAX_TOTAL_DIFF_LEN = 5000; // chars
const MAX_FILE_DIFF_LEN = 1500; // chars per file section

function truncate(str: string, max: number): string {
  if (str.length > max) {
    return (
      str.slice(0, max) +
      `\n--- [diff truncated, ${str.length - max} chars omitted] ---`
    );
  }
  return str;
}

function smartTruncateDiff(diff: string): string {
  // If total diff is small, return as is
  if (diff.length <= MAX_TOTAL_DIFF_LEN) return diff;

  // Try to break by file: split by "diff --git" sections
  const sections = diff.split(/^diff --git/m);
  if (sections.length === 1) return truncate(diff, MAX_TOTAL_DIFF_LEN);
  // First section may be empty string (if diff starts with 'diff --git')
  let output = '';
  for (let i = 0; i < sections.length; i++) {
    let section = sections[i];
    if (section.trim() === '') continue;
    // Re-add the split marker
    section = (i === 0 ? '' : 'diff --git') + section;
    if (section.length > MAX_FILE_DIFF_LEN) {
      output += truncate(section, MAX_FILE_DIFF_LEN) + '\n';
    } else {
      output += section + '\n';
    }
    // If we've hit the max, truncate full output
    if (output.length > MAX_TOTAL_DIFF_LEN) {
      output =
        output.slice(0, MAX_TOTAL_DIFF_LEN) +
        `\n--- [overall diff truncated, output limited to ${MAX_TOTAL_DIFF_LEN} chars] ---`;
      break;
    }
  }
  return output.trim();
}

export const config = make({
  name: 'git_pr',
  description:
    'Create, list, get diff, or manage GitHub pull requests using the GitHub CLI (gh). Assumes gh is installed and user is authenticated.',
  usage: `**git_pr**: Create, list, get the diff, or manage pull requests. Actions:\n- create: Create a PR. Provide title, body, base, head, draft.\n- list: List open PRs.\n- merge: Merge a PR (provide prNumber).\n- close: Close a PR (provide prNumber).\n- diff: Show the changes of a PR (provide prNumber).`,
  parameters: {
    action: {
      type: 'string',
      enum: ['create', 'list', 'merge', 'close', 'diff'],
      description: 'Action to perform on PRs',
    },
    title: {
      type: 'string',
      description: 'Title for the PR (required for create)',
      nullable: true,
    },
    body: {
      type: 'string',
      description: 'Body for the PR (optional for create)',
      nullable: true,
    },
    base: {
      type: 'string',
      description:
        'Base branch for the PR (optional for create, default: main)',
      nullable: true,
    },
    head: {
      type: 'string',
      description:
        'Head branch for the PR (optional for create, defaults to current branch)',
      nullable: true,
    },
    draft: {
      type: 'boolean',
      description: 'Create as draft PR (optional for create)',
      nullable: true,
    },
    prNumber: {
      type: 'number',
      description: 'PR number (required for merge, close, or diff)',
      nullable: true,
    },
  },
});

export const createTool: CreateTool = function createGitPrTool({ project }) {
  return llm.tool(
    config.name,
    config.description,
    config.parameters,
    async ({ action, title, body, base, head, draft, prNumber }) => {
      const cwd = project.path;
      try {
        if (action === 'create') {
          let cmd = `gh pr create`;
          if (title) cmd += ` --title "${title}"`;
          if (body) cmd += ` --body "${body}"`;
          if (base) cmd += ` --base ${base}`;
          if (head) cmd += ` --head ${head}`;
          if (draft) cmd += ` --draft`;
          const { stdout } = await asyncExec(cmd, { cwd });
          return stdout.trim();
        } else if (action === 'list') {
          const { stdout } = await asyncExec(`gh pr list --limit 10`, { cwd });
          return stdout.trim();
        } else if (action === 'merge') {
          if (!prNumber) return 'prNumber required for merge.';
          const { stdout } = await asyncExec(
            `gh pr merge ${prNumber} --auto --merge`,
            {
              cwd,
            }
          );
          return stdout.trim();
        } else if (action === 'close') {
          if (!prNumber) return 'prNumber required for close.';
          const { stdout } = await asyncExec(`gh pr close ${prNumber}`, {
            cwd,
          });
          return stdout.trim();
        } else if (action === 'diff') {
          if (!prNumber) return 'prNumber required for diff.';
          const { stdout } = await asyncExec(`gh pr diff ${prNumber}`, { cwd });
          return smartTruncateDiff(stdout.trim());
        } else {
          return 'Unknown action.';
        }
      } catch (error) {
        return `Error running gh pr command: ${error}`;
      }
    }
  );
};
