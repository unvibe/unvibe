import { Project } from './lib/project';
import path from 'node:path';
import fs from 'node:fs/promises';

export async function writeFiles(
  project: Project,
  files: { path: string; content: string }[]
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
        await fs.mkdir(path.dirname(filePath), { recursive: true });
        await fs.writeFile(filePath, file.content, 'utf-8');
      })
    );
    return { status: true, message: 'Files added successfully' };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    const stack = error instanceof Error ? error.stack : undefined;
    return { status: false, message, stack };
  }
}
