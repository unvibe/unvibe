/* fast-lint-files.ts – cached incremental ESLint runner
 ------------------------------------------------------------------
 • Uses the **project‑local** `eslint` package (fall‑back to global if absent)
 • Re‑uses a single ESLint instance per project → config parsed once
 • Hashes each virtual file; lints only when text changes
 • Runs changed lint jobs in parallel and merges with cached results
 ------------------------------------------------------------------*/

import path from 'path';
import crypto from 'crypto';
// import stripAnsi from 'strip-ansi';
import { createRequire } from 'module';
import { StructuredOutputMetadata } from '@/server/db/schema';

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

  // const formatter = await eslint.loadFormatter('stylish');
  // const jsonFormatter = await eslint.loadFormatter('json');
  // const jsonString = await jsonFormatter.format(all);
  const metadataDiagnostic: StructuredOutputMetadata['diagnostics']['string'] =
    {};

  all.forEach((result) => {
    if (!metadataDiagnostic[result.filePath]) {
      metadataDiagnostic[result.filePath] = [];
    }

    result.messages.forEach((message) => {
      metadataDiagnostic[result.filePath].push({
        type: message.severity === 2 ? 'error' : 'warning',
        line: message.line,
        column: message.column,
        message: message.message,
      });
    });
  });

  const transformedKeysToUseRelativePaths = Object.fromEntries(
    Object.entries(metadataDiagnostic).map(([key, content]) => {
      const relativePath = path.relative(projectRoot, key);
      return [relativePath, content] as [string, typeof content];
    })
  );

  return JSON.stringify(transformedKeysToUseRelativePaths);
}
