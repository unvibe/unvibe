import { Project } from '@/server/project/types';
import path from 'node:path';
import fs from 'node:fs/promises';

export async function applyFullFile(
  project: Project,
  entry: { path: string; content: string }
): Promise<void> {
  const dir = entry.path.split('/').slice(0, -1).join('/');
  await fs.mkdir(path.join(project.path, dir), { recursive: true });
  await fs.writeFile(
    path.join(project.path, entry.path),
    entry.content ?? '',
    'utf-8'
  );
}
