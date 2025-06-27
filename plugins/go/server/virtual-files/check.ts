import { spawnSync } from 'node:child_process';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import fs from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';

/* ------------------------------------------------------------------ */
/* 📝  Types                                                           */
/* ------------------------------------------------------------------ */
export type VirtualFile = { path: string; content: string };

/* ------------------------------------------------------------------ */
/* 🔍  Utilities                                                       */
/* ------------------------------------------------------------------ */

/** Walk upward from `start` until a go.mod or go.work is found. */
function findModuleRoot(start: string): string | null {
  let dir = path.resolve(start);
  const { root } = path.parse(dir);

  while (dir !== root) {
    if (
      fs.existsSync(path.join(dir, 'go.mod')) ||
      fs.existsSync(path.join(dir, 'go.work'))
    )
      return dir;
    dir = path.dirname(dir);
  }
  return null;
}

/** Run `go vet` with an overlay for one module group. */
async function vetGroup(
  moduleRoot: string,
  files: VirtualFile[],
  projectRoot: string
): Promise<string> {
  const temp = await mkdtemp(path.join(tmpdir(), 'go-overlay-'));

  try {
    /* 1️⃣  materialise virtual files + overlay manifest */
    const replace: Record<string, string> = {};

    for (const f of files) {
      const abs = path.resolve(projectRoot, f.path);
      const tmpFile = path.join(temp, `${crypto.randomUUID()}.go`);
      await writeFile(tmpFile, f.content, 'utf8');
      replace[abs] = tmpFile;
    }

    const overlayPath = path.join(temp, 'overlay.json');
    await writeFile(overlayPath, JSON.stringify({ Replace: replace }), 'utf8');

    /* 2️⃣  run go vet */
    const { status, stderr } = spawnSync(
      'go',
      ['vet', '-overlay', overlayPath, './...'],
      { cwd: moduleRoot, encoding: 'utf8' }
    );

    return status === 0
      ? ''
      : `▶ ${path.relative(projectRoot, moduleRoot) || '.'}\n${stderr.trim()}`;
  } finally {
    /* 3️⃣  ALWAYS clean up */
    await rm(temp, { recursive: true, force: true });
  }
}

/* ------------------------------------------------------------------ */
/* 🚀  Public API – just call `check()`                                */
/* ------------------------------------------------------------------ */

/**
 * Type-checks arbitrary Go “virtual files”.
 * Groups files by the nearest `go.mod` and executes a separate
 * `go vet -overlay ...` per group.  Returns an empty string on success
 * or a concatenated diagnostics string on failure.
 */
export async function check(
  virtualFiles: VirtualFile[],
  projectRoot: string
): Promise<string> {
  /* 0️⃣  partition files by module root */
  const groups = new Map<string, VirtualFile[]>();

  for (const f of virtualFiles) {
    const abs = path.resolve(projectRoot, f.path);
    const modRoot = findModuleRoot(path.dirname(abs));

    if (!modRoot) {
      return (
        `no go.mod found for ${f.path}.  Run 'go mod init' ` +
        `or pass a projectRoot inside the module.`
      );
    }
    (groups.get(modRoot) ?? groups.set(modRoot, []).get(modRoot)!).push(f);
  }

  /* 1️⃣  vet each group in parallel (limited to CPU count) */
  const results = await Promise.all(
    Array.from(groups.entries()).map(([root, files]) =>
      vetGroup(root, files, projectRoot)
    )
  );

  /* 2️⃣  merge non-empty diagnostics */
  const failures = results.filter(Boolean);
  return failures.length ? failures.join('\n\n') : '';
}
