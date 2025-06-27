import { Dirent } from 'node:fs';
import path from 'node:path';

export function filterDir(
  dir: Dirent[],
  matcher: (fullPath: string) => boolean
): Dirent[] {
  return dir.filter((file) => {
    const fullPath = file.parentPath
      ? path.join(file.parentPath, file.name)
      : file.name;
    if (file.name === '.git') return false;
    if (file.name === 'node_modules') return false;
    if (file.name === 'package-lock.json') return false;
    if (file.name === 'yarn.lock') return false;
    if (file.name === 'next-env.d.ts') return false;
    if (!matcher(fullPath)) return true;
    if (file.isDirectory()) return true;
    return false;
  });
}
