/* fast-lint-files.ts – cached incremental ESLint runner
 ------------------------------------------------------------------
 • Uses the **project‑local** `eslint` package (fall‑back to global if absent)
 • Re‑uses a single ESLint instance per project → config parsed once
 • Hashes each virtual file; lints only when text changes
 • Runs changed lint jobs in parallel and merges with cached results
 ------------------------------------------------------------------*/

import path from 'path';
import crypto from 'crypto';
import stripAnsi from 'strip-ansi';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
// ---------------------- local ESLint loader ----------------------
type ESLintCtor = typeof import('eslint').ESLint;

function loadProjectESLint(projectRoot: string): ESLintCtor {
  const local = path.resolve(projectRoot, 'node_modules', 'eslint');
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require(local).ESLint as ESLintCtor; // project-local
  } catch {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('eslint').ESLint as ESLintCtor; // fallback
  }
}

// ------------------------- types -------------------------
export type VirtualFile = { path: string; content: string };

interface LintCtx {
  eslint: import('eslint').ESLint;
  versionMap: Map<string, string>; // absPath ➜ content hash
  resultCache: Map<string, import('eslint').ESLint.LintResult>; // absPath ➜ last result
}

const ctxCache = new Map<string, LintCtx>();
const hash = (t: string) => crypto.createHash('sha1').update(t).digest('hex');

// ---------------------------------------------------------
export async function lint(
  virtualFiles: VirtualFile[],
  projectRoot: string
): Promise<string> {
  /* 1️⃣  context */
  let ctx = ctxCache.get(projectRoot);
  if (!ctx) {
    const ESLint = loadProjectESLint(projectRoot);
    const eslint = new ESLint({ cwd: projectRoot });
    ctx = { eslint, versionMap: new Map(), resultCache: new Map() };
    ctxCache.set(projectRoot, ctx);
  }

  const { eslint, versionMap, resultCache } = ctx;

  /* 2️⃣  schedule lint for changed files */
  const lintPromises: Promise<import('eslint').ESLint.LintResult[]>[] = [];
  const unchanged: import('eslint').ESLint.LintResult[] = [];

  for (const f of virtualFiles) {
    if (!/\.(js|jsx|ts|tsx)$/.test(f.path)) continue;
    const abs = path.resolve(projectRoot, f.path);
    const h = hash(f.content);
    if (versionMap.get(abs) === h) {
      const cached = resultCache.get(abs);
      if (cached) unchanged.push(cached);
      continue;
    }
    versionMap.set(abs, h);
    lintPromises.push(eslint.lintText(f.content, { filePath: abs }));
  }

  const freshArrays = await Promise.all(lintPromises);
  const fresh = freshArrays.flat();
  fresh.forEach((r) => resultCache.set(r.filePath, r));

  const all = [...unchanged, ...fresh];
  if (!all.length) return '';

  const formatter = await eslint.loadFormatter('stylish');
  return stripAnsi(await formatter.format(all));
}
