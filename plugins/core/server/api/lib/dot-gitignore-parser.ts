// dot-gitignore-parser.ts  (v2 – powered by `ignore`)
// ---------------------------------------------------
import fs from 'node:fs';
import path from 'node:path';
import ignore, { Ignore } from 'ignore';

const DEFAULT_IGNORE_PATH = path.join(__dirname, 'default-dot-gitignore');
let defaultIg: Ignore | null = null; // cached compiled rules

/* ── helpers ─────────────────────────────────────────────────────────────── */
const loadDefault = (): Ignore => {
  if (defaultIg) return defaultIg; // already cached
  const txt = fs.readFileSync(DEFAULT_IGNORE_PATH, 'utf8');
  defaultIg = ignore().add(txt);
  return defaultIg;
};

const toRel = (projectPath: string, fsPath: string): string =>
  path.relative(projectPath, path.resolve(fsPath)).replace(/\\/g, '/');

/* ── public API ──────────────────────────────────────────────────────────── */
/**
 * Return `true` if `fsPath` should be ignored.
 * @param fsPath        Absolute or relative file/dir path.
 * @param gitignoreTxt  Optional custom .gitignore text; if omitted, we fall
 *                      back to `default-dot-gitignore`.
 */
export function shouldIgnore(
  projectPath: string,
  fsPath: string,
  gitignoreTxt?: string
): boolean {
  if (gitignoreTxt) {
    return loadDefault().add(gitignoreTxt).ignores(toRel(projectPath, fsPath));
  }
  return loadDefault().ignores(toRel(projectPath, fsPath));
}

/**
 * Create a reusable matcher with pre‑compiled rules.
 * @param gitignoreTxt  Optional .gitignore text (same fallback behaviour).
 */
export function createIgnoreMatcher(
  projectPath: string,
  gitignoreTxt?: string
): (p: string) => boolean {
  const ig = gitignoreTxt ? ignore().add(gitignoreTxt) : loadDefault();
  return (p: string) => ig.ignores(toRel(projectPath, p));
}
