// Project file cache primitive for incremental parsing
import fs from 'node:fs/promises';
import crypto from 'node:crypto';

export type FileCacheEntry = {
  hash: string;
  content: string;
  mtimeMs: number;
  size: number;
};

export type FileCache = {
  [filePath: string]: FileCacheEntry;
};

/** Compute a SHA-1 hash of file content */
export async function computeFileHash(content: string): Promise<string> {
  return crypto.createHash('sha1').update(content).digest('hex');
}

/** Load a file and compute its hash and stat */
export async function loadFileWithHash(path: string): Promise<FileCacheEntry> {
  const content = await fs.readFile(path, 'utf8');
  const hash = await computeFileHash(content);
  const stat = await fs.stat(path);
  return {
    hash,
    content,
    mtimeMs: stat.mtimeMs,
    size: stat.size,
  };
}

/** Compare a file's stat/hash against cache; reload if changed */
export async function updateCacheEntry(
  path: string,
  oldEntry?: FileCacheEntry
): Promise<FileCacheEntry> {
  const stat = await fs.stat(path);
  if (
    oldEntry &&
    oldEntry.mtimeMs === stat.mtimeMs &&
    oldEntry.size === stat.size
  ) {
    // Assume unchanged (fast path)
    return oldEntry;
  }
  // If stat changed, re-read and hash
  const content = await fs.readFile(path, 'utf8');
  const hash = await computeFileHash(content);
  return {
    hash,
    content,
    mtimeMs: stat.mtimeMs,
    size: stat.size,
  };
}
