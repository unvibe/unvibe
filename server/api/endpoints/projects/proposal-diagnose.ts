import { z } from 'zod';
import { createEndpoint } from '../../create-endpoint';
import {
  SourceCodeDiagnosticHook,
  SourceCodeHook,
} from '@/plugins/_types/plugin.server';
import { _parseProject, loadPlugins, normalizePath } from './utils';
import { ModelResponseStructure } from '@/server/llm/structured_output';
import { Project } from '@/plugins/core/server/api/lib/project';

export async function runProposalDiagnostics(
  proposal: ModelResponseStructure,
  project: Project
) {
  const plugins = await loadPlugins(project);
  const addedFiles = proposal.replace_files || [];
  const deletedFiles = proposal.delete_files || [];
  const editedFiles = proposal.edit_files || [];
  const content = [
    ...addedFiles,
    ...deletedFiles.map((file) => ({ path: file.path, content: '' })),
    ...editedFiles.map((file) => {
      const source =
        project.EXPENSIVE_REFACTOR_LATER_content[normalizePath(file.path)] ||
        '';
      // todo apply the range to the source
      // Apply the edit by lines
      const sourceLines = source.split('\n');
      const editLines = file.content.split('\n');
      // split the source lines in two parts
      const newLines = [...sourceLines];
      newLines.splice(file.insert_at - 1, 0, ...editLines);
      const appliedContent = newLines.join('\n');
      return {
        path: file.path,
        content: appliedContent,
      };
    }),
  ];

  // console.log('content after edit', content);
  // run diagnostics on the content
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

  return await Promise.all(hookPromises);
}

export const getProposalDiagnostic = createEndpoint({
  type: 'POST',
  pathname: '/projects/diagnose',
  params: z.object({
    projectDirname: z.string(),
    source: z.string(),
    proposal: z.object({
      message: z.string(),
      replace_files: z
        .array(z.object({ path: z.string(), content: z.string() }))
        .optional(),
      delete_files: z.array(z.object({ path: z.string() })).optional(),
      edit_files: z
        .array(
          z.object({
            path: z.string(),
            content: z.string(),
            insert_at: z.number(), // 1-based index
          })
        )
        .optional(),
      shell_scripts: z.array(z.string()).optional(),
    }),
  }),
  handler: async ({ parsed }) => {
    const { source, projectDirname } = parsed;
    const project = await _parseProject(source, projectDirname);
    const result = await runProposalDiagnostics(parsed.proposal, project);

    return {
      result,
    };
  },
});
