import { make } from '@/plugins/_types/tools';
import { runShellCommand } from '@/plugins/core/server/api/lib/run-shell-command';
import type { LLMToolModule } from '@/plugins/_types/plugin.server';
import type { Project } from '@/plugins/core/server/api/lib/project';

export const config = make({
  name: 'go_mod_init',
  description: 'Initialize a Go module in the project directory with the given module name.',
  usage: '**go_mod_init**: Initialize a Go module.\n\nParams:\n- moduleName (string, required): The module name for go.mod',
  parameters: {
    moduleName: { type: 'string', description: 'The module name for go.mod' }
  }
});

export const createTool = ({ project }: { project: Project }) => ({
  name: config.name,
  description: config.description,
  parameters: config.parameters,
  fn: async (args: unknown) => {
    const { moduleName } = args as { moduleName: string };
    if (!moduleName || typeof moduleName !== 'string') {
      throw new Error('moduleName is required and must be a string');
    }
    const cwd = project.path;
    try {
      const output = await runShellCommand(`go mod init ${moduleName}`, { cwd });
      return { result: 'success', output };
    } catch (e) {
      return { result: 'error', error: String(e) };
    }
  },
});

const goModInitTool: LLMToolModule = {
  config,
  createTool,
};

export default goModInitTool;
