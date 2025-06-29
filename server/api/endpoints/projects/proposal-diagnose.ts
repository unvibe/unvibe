import { z } from 'zod';
import { createEndpoint } from '../../create-endpoint';
import { _parseProject, runProposalDiagnostics } from './utils';

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
