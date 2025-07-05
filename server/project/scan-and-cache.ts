// Incremental project scanner with hash/stat cache
import fsp from 'node:fs/promises';
import path from 'node:path';
import { FileCache, updateCacheEntry } from './cache';
import { loadBasePatterns } from './ignored';
import ignore, { Ignore } from 'ignore';
import { isBinary } from './utils';

// Load and update the file cache for a project directory
export async function scanProjectFilesWithCache(
  rootDir: string,
  oldCache: FileCache = {}
): Promise<FileCache> {
  const out: FileCache = {};
  const basePatterns = loadBasePatterns(rootDir);
  const rootIg = ignore().add(basePatterns);

  // BFS queue for directories
  const queue: Array<{ dir: string; ig: Ignore; relPrefix: string }> = [
    { dir: rootDir, ig: rootIg, relPrefix: '' },
  ];
  // Track files found
  const seen = new Set<string>();

  while (queue.length) {
    const { dir, ig, relPrefix } = queue.pop()!;

    // Absorb .gitignore in this directory
    let nestedIg = ig;
    const gitignorePath = path.join(dir, '.gitignore');
    try {
      const txt = await fsp.readFile(gitignorePath, 'utf8');
      if (txt.trim()) {
        const addPrefix = relPrefix ? `${relPrefix}/` : '';
        const local = txt
          .split(/\r?\n/)
          .map((l) => (l && !l.startsWith('#') ? addPrefix + l : l));
        nestedIg = ignore().add([...basePatterns, ...local]);
      }
    } catch {
      /* no local .gitignore */
    }

    const entries = await fsp.readdir(dir, { withFileTypes: true });
    const nextReads: Promise<void>[] = [];
    for (const ent of entries) {
      if (ent.name === '.git' || ent.name === '.gitignore') continue;
      const abs = path.join(dir, ent.name);
      const rel = `./${relPrefix}${ent.name}`;
      if (nestedIg.ignores(rel.slice(2))) continue;

      if (ent.isDirectory()) {
        queue.push({
          dir: abs,
          ig: nestedIg,
          relPrefix: `${relPrefix}${ent.name}/`,
        });
      } else {
        seen.add(rel);
        if (isBinary(ent.name)) {
          out[rel] = { hash: '', content: '', mtimeMs: 0, size: 0 };
        } else {
          nextReads.push(
            (async () => {
              try {
                const stat = await fsp.stat(abs);
                // skip very large files
                if (stat.size > 1024 * 1024) {
                  out[rel] = {
                    hash: '',
                    content: '',
                    mtimeMs: stat.mtimeMs,
                    size: stat.size,
                  };
                  return;
                }
                // Use cache if stat matches
                const cached = oldCache[rel];
                if (
                  cached &&
                  cached.mtimeMs === stat.mtimeMs &&
                  cached.size === stat.size
                ) {
                  out[rel] = cached;
                } else {
                  const updated = await updateCacheEntry(abs, cached);
                  out[rel] = updated;
                }
              } catch {
                // ignore errors (likely deleted mid-scan)
              }
            })()
          );
        }
      }
    }
    if (nextReads.length) await Promise.all(nextReads);
  }

  // Remove files not present anymore
  for (const file in oldCache) {
    if (!seen.has(file)) {
      // skipped
    }
  }

  return out;
}
