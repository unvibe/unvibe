import path from 'node:path';

export function makeFilesExtensionMap(files: string[]): Record<string, number> {
  const map: Record<string, number> = {};
  files.forEach((file) => {
    const ext = path.extname(file);
    map[ext] = (map[ext] || 0) + 1;
  });
  return map;
}
