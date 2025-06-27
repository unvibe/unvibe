import { make, CreateTool } from '@/plugins/_types/tools';
import * as llm from '@/server/llm';
import { runShellCommand } from '../api/lib/run-shell-command';

export const config = make({
  name: 'shell_command',
  description: `Execute a shell command in the workspace.\n\n**IMPORTANT:** Use this tool only for read-only commands (like cat, ls, head, grep, etc.) or as an escape hatch to gain additional context. Do **not** use it to run install commands or any command that mutates the OS or the environment in any way unless explicit permission is granted. For such commands, you must request that the command be run first.\n\nReturns stdout if successful; stderr or error otherwise. Should be used carefully and only for safe, idempotent operations. Be careful with commands that could return a large number of lines or large outputs, use the shell command with caution, for example if it's run in a possible nodejs project, make sure to ignore node_modules, dist and other large directories.`,
  usage: `**shell_command**: Run a shell command on the server.\n\nUse only for read-only operations or to obtain additional context. For install or mutating commands, request permission before attempting.\n\nParams:\n- command (string, required): The shell command to execute.\n- cwd     (string, optional): Working directory (default: project root).`,
  parameters: {
    command: { type: 'string', description: 'The shell command to execute.' },
    cwd: {
      type: 'string',
      description: 'Working directory (default: project root).',
      nullable: true,
    },
  },
});

export const createTool: CreateTool = ({ project }) => {
  return llm.tool(
    config.name,
    config.description,
    config.parameters,
    async ({ command, cwd }) => {
      if (typeof command !== 'string' || command.trim().length === 0) {
        throw new Error(
          '`command` is required and must be a non-empty string.'
        );
      }
      try {
        // cwd defaults to project.path if not provided
        const out = await runShellCommand(command, {
          cwd: cwd || project.path,
        });
        return { status: true, stdout: out };
      } catch (error) {
        return {
          status: false,
          error: error instanceof Error ? error.message : String(error),
        };
      }
    }
  );
};
