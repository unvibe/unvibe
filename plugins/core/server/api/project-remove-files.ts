import { Project } from './lib/project';
import path from 'node:path';
import fs from 'node:fs/promises';

export async function removeFiles(
  project: Project,
  files: { path: string }[]
): Promise<{
  status: boolean;
  message: string;
  stack?: string;
}> {
  const projectPath = project.path;
  try {
    await Promise.all(
      files.map(async (file) => {
        const filePath = path.join(projectPath, file.path);
        await fs.unlink(filePath).catch((err) => {
          if (err.code !== 'ENOENT') {
            throw err; // rethrow if it's not a "file not found" error
          }
        });
      })
    );
    return { status: true, message: 'Files removed successfully' };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    const stack = error instanceof Error ? error.stack : undefined;
    return { status: false, message, stack };
  }
}
