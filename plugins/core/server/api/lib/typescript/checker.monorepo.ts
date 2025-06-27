/* fast-check-types.ts – incremental checker (multi-tsconfig edition)
   ------------------------------------------------------------------
   • Groups virtual files by their closest tsconfig.json (monorepo-ready)
   • Keeps a full ProjectCtx cache **per tsconfig** for speed
   • Diagnostics logic, host patching, hashing, builder call → UNCHANGED
   ------------------------------------------------------------------*/

import path from 'path';
import crypto from 'crypto';

// --------------------------- public types --------------------------
export type VirtualFile = { path: string; content: string };

// ------------------------- internal types --------------------------
interface ProjectCtx {
  ts: typeof import('typescript');
  config: import('typescript').ParsedCommandLine;
  host: import('typescript').CompilerHost; // created with createIncrementalCompilerHost
  program?: import('typescript').EmitAndSemanticDiagnosticsBuilderProgram;
  versionMap: Map<string, string>; // file → version hash
  sourceCache: Map<string, import('typescript').SourceFile>;
}

// ---------------------- per-tsconfig cache -------------------------
const cache = new Map<string /* cfgPath|<none> */, ProjectCtx>();

const SHA1 = (txt: string) =>
  crypto.createHash('sha1').update(txt).digest('hex');

// ------------------------------------------------------------------
export async function checkTypes(
  virtualFiles: VirtualFile[],
  projectRoot: string
): Promise<string> {
  // Load the caller’s TypeScript once (same as before, but upfront)
  const tsPath = path.resolve(
    projectRoot,
    'node_modules',
    'typescript',
    'lib',
    'typescript.js'
  );
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const ts = require(tsPath) as typeof import('typescript');

  // 1️⃣  Group virtual files by their nearest tsconfig.json
  const groups = new Map<string /* cfgPath */, VirtualFile[]>();

  for (const vf of virtualFiles) {
    const abs = path.resolve(projectRoot, vf.path);
    const cfgPath =
      ts.findConfigFile(path.dirname(abs), ts.sys.fileExists) ?? '<none>';
    (groups.get(cfgPath) ?? groups.set(cfgPath, []).get(cfgPath)!).push(vf);
  }

  // If any file lacks a tsconfig, mimic old behaviour
  if (groups.has('<none>')) return 'tsconfig.json not found';

  // Collect formatted diagnostics from every tsconfig group
  const output: string[] = [];

  for (const [cfgPath, vfs] of groups) {
    const ctx = ensureCtx(cfgPath, ts);
    const text = runDiagnostics(ctx, vfs, projectRoot);
    if (text) output.push(text);
  }

  return output.join('\n');
}

// ------------------------------------------------------------------
//                      helpers  (unchanged logic)
// ------------------------------------------------------------------

function ensureCtx(
  cfgPath: string,
  ts: typeof import('typescript')
): ProjectCtx {
  const hit = cache.get(cfgPath);
  if (hit) return hit;

  const cfgJson = ts.readConfigFile(cfgPath, ts.sys.readFile);
  const parsed = ts.parseJsonConfigFileContent(
    cfgJson.config,
    ts.sys,
    path.dirname(cfgPath)
  );
  const host = ts.createIncrementalCompilerHost(parsed.options);

  const ctx: ProjectCtx = {
    ts,
    config: parsed,
    host,
    versionMap: new Map(),
    sourceCache: new Map(),
  };
  cache.set(cfgPath, ctx);
  return ctx;
}

function runDiagnostics(
  ctx: ProjectCtx,
  vFiles: VirtualFile[],
  projectRoot: string
): string {
  const { ts, config, host, versionMap, sourceCache } = ctx;

  // 2️⃣  map virtual files
  const vmap = new Map<string, string>();
  for (const f of vFiles) {
    const abs = path.resolve(projectRoot, f.path);
    if (!/\.(ts|tsx|js|jsx)$/.test(abs)) continue;
    vmap.set(abs, f.content);
  }

  // 3️⃣  patched host
  host.readFile = (fileName) =>
    vmap.get(path.resolve(fileName)) ?? ts.sys.readFile(fileName);

  host.getSourceFile = (
    fileName: string,
    lang: import('typescript').ScriptTarget
  ) => {
    const resolved = path.resolve(fileName);
    const content = vmap.get(resolved) ?? ts.sys.readFile(resolved);
    if (content === undefined) return undefined;

    const prev = sourceCache.get(resolved);
    const hash = SHA1(content);
    if (prev && versionMap.get(resolved) === hash) return prev;

    const sf = ts.createSourceFile(resolved, content, lang);
    // @ts-expect-error – custom field recognised by builder
    sf.version = hash;
    versionMap.set(resolved, hash);
    sourceCache.set(resolved, sf);
    return sf;
  };

  // 4️⃣  build (no oldProgram — same as original)
  const builder = ts.createIncrementalProgram({
    rootNames: [...config.fileNames, ...vmap.keys()],
    options: {
      ...config.options,
      skipLibCheck: true,
      tsBuildInfoFile: '.tsbuildinfo',
    },
    host,
  });
  ctx.program = builder; // cached for nothing else (kept for parity)
  const program = builder.getProgram();

  // 5️⃣  diagnostics (unchanged)
  const diagnostics: import('typescript').Diagnostic[] = [];
  for (const absPath of vmap.keys()) {
    const sf = program.getSourceFile(absPath);
    if (sf) diagnostics.push(...ts.getPreEmitDiagnostics(program, sf));
  }

  builder.emit(); // keep .tsbuildinfo fresh

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
