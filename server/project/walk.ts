import { noop } from '@/lib/core/noop';
import fsp from 'node:fs/promises';
import path from 'node:path';
import ignore, { Ignore } from 'ignore';
import { isBinary } from './utils';
import { loadBasePatterns } from './ignored';

/* ------------------------------------------------------------------ */
/* ⚡️  non-recursive, queue-based walk – avoids deep call stacks       */
/* ------------------------------------------------------------------ */
export async function walk(rootDir: string): Promise<Record<string, string>> {
  const out: Record<string, string> = {};
  const basePatterns = loadBasePatterns(rootDir);
  const rootIg = ignore().add(basePatterns);

  /** BFS queue so we don’t blow the call-stack on huge repos */
  const queue: Array<{ dir: string; ig: Ignore; relPrefix: string }> = [
    { dir: rootDir, ig: rootIg, relPrefix: '' },
  ];

  while (queue.length) {
    const { dir, ig, relPrefix } = queue.pop()!;

    /* ---------- absorb .gitignore *in that directory* (if any) ------ */
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
      /* no local .gitignore – perfectly fine */
    }

    /* ---------------- read the directory entries in one syscall ----- */
    const entries = await fsp.readdir(dir, { withFileTypes: true });

    /* bulk process files first – cheap filter, then optional content read */
    const nextReads: Promise<unknown>[] = [];
    for (const ent of entries) {
      if (ent.name === '.git' || ent.name === '.gitignore') continue; // early bail-out

      const abs = path.join(dir, ent.name);
      const rel = `${relPrefix}${ent.name}`;
      if (nestedIg.ignores(rel)) continue;

      if (ent.isDirectory()) {
        queue.push({ dir: abs, ig: nestedIg, relPrefix: `${rel}/` });
      } else {
        const key = `./${rel}`;
        if (isBinary(ent.name)) {
          out[key] = '';
        } else {
          const stat = await fsp.stat(abs);
          // if it's larger than 1MB, skip it
          if (stat.size > 1024 * 1024) {
            out[key] = '';
          } else {
            nextReads.push(
              fsp
                .readFile(abs, 'utf8')
                .then((txt) => {
                  out[key] = txt;
                })
                .catch(noop)
            );
          }
        }
      }
    }
    /* one await per directory keeps concurrency high but fds sane */
    if (nextReads.length) await Promise.all(nextReads);
  }
  return out;
}
