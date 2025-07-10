import { z } from 'zod';
import { createEndpoint } from '../../create-endpoint';
import { _parseProject, loadPlugins } from './utils';
import {
  SourceCodeDiagnosticHook,
  SourceCodeHook,
} from '@/plugins/_types/plugin.server';

export const runDiagnostics = createEndpoint({
  type: 'POST',
  pathname: '/projects/diagnostics',
  params: z.object({
    id: z.string(), // project id
    content: z.array(z.object({ path: z.string(), content: z.string() })),
  }),
  handler: async ({ parsed }) => {
    const { id, content } = parsed;
    const project = await _parseProject(id);
    const plugins = await loadPlugins(project);
    const diagnosticHooks = plugins
      .map((plugin) => plugin.Plugin.sourceCodeHooks)
      .filter((hook): hook is SourceCodeHook[] => !!hook)
      .flat()
      .filter((hook): hook is SourceCodeDiagnosticHook =>
        Boolean(hook.operations.diagnostic)
      );

    const hookPromises: Promise<{ name: string; result: string }>[] = [];

    for (const hook of diagnosticHooks) {
      const hookFiles = content.filter((file) => hook.rule.test(file.path));
      if (hookFiles.length === 0) {
        continue;
      }
      const task = async () => {
        const diagnosticResult = await hook.operations.diagnostic(
          hookFiles,
          project.path
        );
        return { name: hook.name, result: diagnosticResult };
      };

      hookPromises.push(task());
    }

    const result = await Promise.all(hookPromises);
    return {
      result,
    };
  },
});
