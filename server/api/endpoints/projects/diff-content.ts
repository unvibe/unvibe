/* eslint-disable no-empty */
import { z } from 'zod';
import { createEndpoint } from '../../create-endpoint';
import fs from 'node:fs/promises';
import path from 'node:path';
import simpleGit from 'simple-git';
import { resolveHomePath } from '@/plugins/core/server/api/lib/resolve-home-path';

export const diffContent = createEndpoint({
  type: 'POST',
  pathname: '/projects/diff-content',
  params: z.object({
    path: z.string(),
    content: z.string(),
    projectId: z.string(),
  }),
  handler: async ({ parsed }) => {
    const { path: filePath, content, projectId } = parsed;
    const tempPath = `/tmp/${Date.now()}_temp_file`;
    try {
      // make tempfile
      const tempFilePath = tempPath;
      const tempFileContent = content;
      await fs.writeFile(tempFilePath, tempFileContent);
      const rootPath = resolveHomePath(`projects/${projectId}`);
      const resolvedFilePath = path.join(rootPath, filePath);

      const fileExists = await fs
        .access(resolvedFilePath)
        .then(() => true)
        .catch(() => false);

      if (!fileExists) {
        return {
          diff: '',
          fileExists,
        };
      }
      const git = simpleGit({
        baseDir: rootPath,
        binary: 'git',
        maxConcurrentProcesses: 6,
      });

      const diff = await git.diff([
        '--no-index',
        resolvedFilePath,
        tempFilePath,
      ]);
      try {
        await fs.unlink(tempFilePath);
      } catch {}
      return { diff, fileExists };
    } catch (error) {
      // clear any temp files
      try {
        await fs.unlink(tempPath);
      } catch {}
      if (error instanceof Error) {
        return {
          message: `Error: ${error.message}`,
        };
      }
      return {
        message: `Error: ${JSON.stringify(error)}`,
      };
    }
  },
});
