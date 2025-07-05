// Incremental project scanner with hash/stat cache and concurrency pool
import fsp from 'node:fs/promises';
import path from 'node:path';
import { FileCache, updateCacheEntry } from './cache';
import { loadBasePatterns } from './ignored';
import ignore, { Ignore } from 'ignore';
import { noop } from '@/lib/core/noop';

// Simple concurrency pool
function concurrencyPool<T>(
  concurrency: number,
  tasks: (() => Promise<T>)[]
): Promise<T[]> {
  return new Promise((resolve) => {
    const results: T[] = [];
    let running = 0;
    let next = 0;
    let done = 0;
    const total = tasks.length;
    if (total === 0) return resolve([]);

    function run() {
      while (running < concurrency && next < total) {
        const currIndex = next;
        const task = tasks[currIndex];
        next++;
        running++;
        task()
          .then((result) => {
            results[currIndex] = result;
          })
          .catch((err) => {
            console.log(`Error in task ${currIndex}:`, err);
            results[currIndex] = undefined as T;
            // Optionally log error
          })
          .finally(() => {
            running--;
            done++;
            if (done === total) {
              resolve(results);
            } else {
              run();
            }
          });
      }
    }
    run();
  });
}

// Dummy binary check
function isBinary(filename: string): boolean {
  // You may want a smarter check or import your util
  return /\.(png|jpg|jpeg|gif|svg|pdf|zip|tar|gz|bz2|xz|7z|rar|exe|dll|so|class|db|ttf|otf|woff|woff2|ico|mov|mp4|avi|mkv|webm|mp3|wav|flac|ogg|pkl|bin|wasm|proto|pb|h5|sqlite|sqlite3|csv|psd|xcf|raw|apk|ipa|dmg|iso|img)$/i.test(
    filename
  );
}

export async function scanProjectFilesWithCache(
  rootDir: string,
  oldCache: FileCache = {},
  concurrency = 16 // adjustable
): Promise<FileCache> {
  const out: FileCache = {};
  const basePatterns = loadBasePatterns(rootDir);
  const rootIg = ignore().add(basePatterns);
  const queue: Array<{ dir: string; ig: Ignore; relPrefix: string }> = [
    { dir: rootDir, ig: rootIg, relPrefix: '' },
  ];
  const seen = new Set<string>();
  while (queue.length) {
    const { dir, ig, relPrefix } = queue.pop()!;
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
      noop();
    }
    const entries = await fsp.readdir(dir, { withFileTypes: true });
    const fileTasks: (() => Promise<void>)[] = [];
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
          fileTasks.push(async () => {
            try {
              const stat = await fsp.stat(abs);
              if (stat.size > 1024 * 1024) {
                out[rel] = {
                  hash: '',
                  content: '',
                  mtimeMs: stat.mtimeMs,
                  size: stat.size,
                };
                return;
              }
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
              noop();
            }
          });
        }
      }
    }
    if (fileTasks.length) await concurrencyPool(concurrency, fileTasks);
  }
  return out;
}
