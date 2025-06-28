/* fast-check-types.ts – minimal incremental TypeScript checker
 ------------------------------------------------------------------
 • Caches compiler + parsed tsconfig.json + incremental host per projectRoot
 • Uses createIncrementalProgram with `oldProgram` to re‑use the graph
 • Provides versioned SourceFiles so Builder doesn’t crash
 • Injects virtual (in‑memory) files through patched readFile / getSourceFile
 • Returns empty string when no errors, otherwise formatted diagnostics
 ------------------------------------------------------------------*/

import path from 'path';
import crypto from 'crypto';
import { createRequire } from 'module';

// ------------------------- types -------------------------
export type VirtualFile = { path: string; content: string };

const require = createRequire(import.meta.url);

interface ProjectCtx {
  ts: typeof import('typescript');
  config: import('typescript').ParsedCommandLine;
  host: import('typescript').CompilerHost; // ⚠️  created with createIncrementalCompilerHost
  program?: import('typescript').EmitAndSemanticDiagnosticsBuilderProgram;
  versionMap: Map<string, string>; // file ➜ version string
  sourceCache: Map<string, import('typescript').SourceFile>;
}

// -------------------- per‑project cache ------------------
let projectCache = new Map<string, ProjectCtx>();

export const clearCache = () => {
  projectCache = new Map<string, ProjectCtx>();
};

function hash(text: string): string {
  return crypto.createHash('sha1').update(text).digest('hex');
}

// ---------------------------------------------------------
export async function check(
  virtualFiles: VirtualFile[],
  projectRoot: string
): Promise<string> {
  /* 1️⃣  ensure context */
  let ctx = projectCache.get(projectRoot);
  if (!ctx) {
    const tsPath = path.resolve(
      projectRoot,
      'node_modules',
      'typescript',
      'lib',
      'typescript.js'
    );

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const ts = require(tsPath) as typeof import('typescript');

    const cfgPath = ts.findConfigFile(projectRoot, ts.sys.fileExists);
    if (!cfgPath) return 'tsconfig.json not found';

    const cfgJson = ts.readConfigFile(cfgPath, ts.sys.readFile);
    const parsed = ts.parseJsonConfigFileContent(
      cfgJson.config,
      ts.sys,
      path.dirname(cfgPath)
    );

    const host = ts.createIncrementalCompilerHost(parsed.options);

    ctx = {
      ts,
      config: parsed,
      host,
      versionMap: new Map(),
      sourceCache: new Map(),
    };
    projectCache.set(projectRoot, ctx);
  }

  const { ts, config, host, versionMap, sourceCache } = ctx;

  /* 2️⃣  map virtual files */
  const vmap = new Map<string, string>();
  for (const f of virtualFiles) {
    const abs = path.resolve(projectRoot, f.path);
    if (!/\.(ts|tsx|js|jsx)$/.test(abs)) continue; // ignore other file types
    vmap.set(abs, f.content);
  }

  /* 3️⃣  patch host so compiler sees virtual files + versions */
  // Patch fileExists to recognize virtual files
  const originalFileExists = host.fileExists;
  host.fileExists = (fileName: string): boolean => {
    const resolved = path.resolve(fileName);
    return vmap.has(resolved) || originalFileExists.call(ts.sys, fileName);
  };

  // Patch readFile (already implemented but updated to use resolved path consistently)
  host.readFile = (fileName: string) => {
    const resolved = path.resolve(fileName);
    return vmap.get(resolved) ?? ts.sys.readFile(fileName);
  };

  // Patch getSourceFile for versioning and caching
  host.getSourceFile = (
    fileName: string,
    languageVersion: import('typescript').ScriptTarget
    // onError?: (message: string) => void,
    // shouldCreateNewSourceFile?: boolean
  ) => {
    const resolved = path.resolve(fileName);
    const content = vmap.get(resolved) ?? ts.sys.readFile(resolved);
    if (content === undefined) return undefined;

    const prev = sourceCache.get(resolved);
    const hashNow = hash(content);
    if (prev && versionMap.get(resolved) === hashNow) return prev;

    const sf = ts.createSourceFile(resolved, content, languageVersion);
    // @ts-expect-error – TypeScript allows arbitrary fields on SourceFile for versioning in builder mode
    sf.version = hashNow;
    versionMap.set(resolved, hashNow);
    sourceCache.set(resolved, sf);
    return sf;
  };

  // Track virtual directories based on virtual files
  const virtualDirs = new Set<string>();
  for (const filePath of vmap.keys()) {
    let dir = path.dirname(filePath);
    while (dir && dir !== projectRoot && dir !== '/') {
      virtualDirs.add(dir);
      dir = path.dirname(dir);
    }
  }

  // Patch directoryExists to recognize virtual directories
  const originalDirectoryExists: NonNullable<typeof host.directoryExists> =
    host.directoryExists!;

  host.directoryExists = (dirPath: string): boolean => {
    const resolved = path.resolve(dirPath);
    return (
      virtualDirs.has(resolved) ||
      originalDirectoryExists?.call(ts.sys, dirPath)
    );
  };

  // Patch readDirectory to include virtual files
  const originalReadDirectory: NonNullable<typeof host.readDirectory> =
    host.readDirectory!;

  host.readDirectory = (
    dirPath: string,
    extensions?: readonly string[],
    exclude?: readonly string[],
    include?: readonly string[],
    depth?: number
  ): string[] => {
    const originalResults = originalReadDirectory.call(
      ts.sys,
      dirPath,
      extensions ?? [],
      exclude,
      include ?? [],
      depth
    );

    // Add virtual files that belong in this directory
    const resolved = path.resolve(dirPath);
    const virtualFiles = Array.from(vmap.keys())
      .filter((file) => path.dirname(file) === resolved)
      .filter((file) => {
        if (!extensions) return true;
        return extensions.some((ext) => file.endsWith(ext));
      });

    return [...originalResults, ...virtualFiles];
  };

  /* 4️⃣  (re)build builder program incrementally */
  const builder = ts.createIncrementalProgram({
    rootNames: [...config.fileNames, ...vmap.keys()],
    options: {
      ...config.options,
      skipLibCheck: true,
      tsBuildInfoFile: '.tsbuildinfo', // TODO: use a temp dir
    },
    host,
  });
  ctx.program = builder; // cache for next invocation
  const program = builder.getProgram();

  /* 5️⃣  gather diagnostics one file at a time */

  const diagnostics: import('typescript').Diagnostic[] = [];
  for (const absPath of vmap.keys()) {
    const sf = program.getSourceFile(absPath);
    if (sf) diagnostics.push(...ts.getPreEmitDiagnostics(program, sf));
  }

  builder.emit(); // optional – keeps build info fresh

  if (!diagnostics.length) return '';

  return diagnostics
    .map((d) => {
      const msg = ts.flattenDiagnosticMessageText(d.messageText, '\n');
      if (d.file && typeof d.start === 'number') {
        const { line, character } = d.file.getLineAndCharacterOfPosition(
          d.start
        );
        return `${d.file.fileName} (${line + 1},${character + 1}): ${msg}`;
      }
      return msg;
    })
    .join('\n');
}
