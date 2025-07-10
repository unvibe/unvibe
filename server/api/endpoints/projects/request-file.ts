import { z } from 'zod';
import { createEndpoint } from '../../create-endpoint';
import { resolveHomePath } from '@/server/project/utils';
import fs from 'node:fs/promises';
import path from 'node:path';
import { pathFromId } from '@/server/project';
// import { runProposalDiagnostics, _parseProject } from './utils';

export const requestFile = createEndpoint({
  type: 'GET',
  pathname: '/projects/request-file',
  params: z.object({
    projectId: z.string(),
    filePath: z.string(),
  }),
  handler: async ({ parsed }) => {
    const { projectId, filePath } = parsed;
    // const project = await _parseProject('projects', projectId);
    const fileAbsolutePath = resolveHomePath(
      path.join(pathFromId(projectId), filePath)
    );
    try {
      const content = await fs.readFile(fileAbsolutePath, 'utf-8');
      // const diagnostics = await runProposalDiagnostics(
      //   {
      //     message: '',
      //     replace_files: [{ path: fileAbsolutePath, content: content }],
      //   },
      //   project
      // );
      return {
        content,
        filePath: path.basename(filePath),
        // diagnostics,
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : String(error),
      };
    }
  },
});
