/* format-virtual-files.ts – resilient Prettier formatting
   ---------------------------------------------------------
   • Locates Prettier like VS Code: workspace → global → bundled
   • Caches resolved configs + ignore checks
   • Returns VirtualFile[] with prettified content (or untouched if Prettier missing)
   --------------------------------------------------------- */

import { createRequire } from 'module';
import path from 'path';

const require = createRequire(import.meta.url);

export type VirtualFile = { path: string; content: string };

/* ---------------- caches ---------------- */
const configCache = new Map<string /* dir */, Record<string, unknown> | null>();
const ignoreCache = new Map<string /* absPath */, boolean>();

/* ---------------- public API ------------- */
export async function format(
  virtualFiles: VirtualFile[],
  projectRoot: string
): Promise<VirtualFile[]> {
  const prettier = loadPrettier(projectRoot);
  if (!prettier) {
    console.warn('⚠️  Prettier not found – skipping formatting step.');
    return virtualFiles;
  }

  /* Tell the type-checker we’re done with null */
  const p: NonNullable<typeof prettier> = prettier;

  async function prettify(vf: VirtualFile): Promise<VirtualFile> {
    const absPath = path.resolve(projectRoot, vf.path);

    if (await isIgnored(absPath, p)) return vf;

    const dir = path.dirname(absPath);
    let opts = configCache.get(dir);
    if (opts === undefined) {
      opts = await p.resolveConfig(absPath);
      configCache.set(dir, opts ?? null);
    }

    const formatted = await p.format(vf.content, {
      ...opts,
      filepath: absPath, // lets Prettier infer parser
    });

    return { ...vf, content: formatted };
  }

  return Promise.all(virtualFiles.map(prettify));
}

/* ------------- helpers ------------------- */

/** VS-Code-style Prettier resolver (local → global → bundled) */
function loadPrettier(root: string): typeof import('prettier') | null {
  const probes: (() => string)[] = [
    () => require.resolve('prettier', { paths: [root] }),
    () => require.resolve('prettier'),
    () => require.resolve('prettier/standalone'),
  ];

  for (const probe of probes) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
      return require(probe());
    } catch (e) {
      console.log(e);
      /* try next */
    }
  }
  return null;
}

async function isIgnored(
  absPath: string,
  prettier: NonNullable<typeof import('prettier')>
): Promise<boolean> {
  if (ignoreCache.has(absPath)) return ignoreCache.get(absPath)!;
  const info = await prettier.getFileInfo(absPath, {
    ignorePath: '.prettierignore',
  });
  ignoreCache.set(absPath, info.ignored);
  return info.ignored;
}
