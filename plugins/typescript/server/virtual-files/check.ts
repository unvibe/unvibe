/* fast-check-types.ts – minimal incremental TypeScript checker (cache-free version)
   ------------------------------------------------------------------
   • Loads compiler + parsed tsconfig.json + incremental host per call
   • Uses createIncrementalProgram for fast type-checking
   • Injects virtual (in-memory) files through patched readFile / getSourceFile
   • Returns empty string when no errors, otherwise formatted diagnostics
   ------------------------------------------------------------------*/

import path from 'path';
import crypto from 'crypto';
import { createRequire } from 'module';
import { StructuredOutputMetadata } from '@/server/db/schema';
import fs from 'fs';

export type VirtualFile = { path: string; content: string };
const require = createRequire(import.meta.url);

function hash(text: string): string {
  return crypto.createHash('sha1').update(text).digest('hex');
}

function findNearestTsconfig(startDir: string): string | null {
  let current = startDir;
  while (true) {
    const candidate = path.join(current, 'tsconfig.json');
    if (fs.existsSync(candidate)) return candidate;
    const parent = path.dirname(current);
    if (parent === current) break;
    current = parent;
  }
  return null;
}

export async function check(
  virtualFiles: VirtualFile[],
  projectRoot: string
): Promise<string> {
  // 1️⃣ Load typescript fresh every time
  const tsPath = path.resolve(
    projectRoot,
    'node_modules',
    'typescript',
    'lib',
    'typescript.js'
  );
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const ts = require(tsPath) as typeof import('typescript');

  // --- Group virtual files by nearest tsconfig.json, keeping original file paths ---
  const virtualFilesByTsconfig: Record<string, string[]> = {};
  for (const vf of virtualFiles) {
    const absPath = path.resolve(projectRoot, vf.path);
    const dir = path.dirname(absPath);
    const tsconfig = findNearestTsconfig(dir);
    if (tsconfig) {
      if (!virtualFilesByTsconfig[tsconfig])
        virtualFilesByTsconfig[tsconfig] = [];
      virtualFilesByTsconfig[tsconfig].push(vf.path); // use original user-provided path
    }
  }

  // --- Diagnostics logic, now per tsconfig group ---
  const metadataDiagnostic: StructuredOutputMetadata['diagnostics']['string'] =
    {};

  for (const [tsconfigPath, paths] of Object.entries(virtualFilesByTsconfig)) {
    const cfgJson = ts.readConfigFile(tsconfigPath, ts.sys.readFile);
    const config = ts.parseJsonConfigFileContent(
      cfgJson.config,
      ts.sys,
      path.dirname(tsconfigPath)
    );
    const host = ts.createIncrementalCompilerHost(config.options);

    // Map ONLY the virtual files for this group
    const vmap = new Map<string, string>();
    for (const filePath of paths) {
      const abs = path.resolve(projectRoot, filePath);
      const vf = virtualFiles.find((v) => v.path === filePath);
      if (!vf) continue;
      if (!/\.(ts|tsx|js|jsx)$/.test(abs)) continue;
      vmap.set(abs, vf.content);
    }

    // Patch host to recognize these virtual files
    const originalFileExists = host.fileExists;
    host.fileExists = (fileName: string): boolean => {
      const resolved = path.resolve(fileName);
      return vmap.has(resolved) || originalFileExists.call(ts.sys, fileName);
    };
    host.readFile = (fileName: string) => {
      const resolved = path.resolve(fileName);
      return vmap.get(resolved) ?? ts.sys.readFile(fileName);
    };
    host.getSourceFile = (
      fileName: string,
      languageVersion: import('typescript').ScriptTarget
    ) => {
      const resolved = path.resolve(fileName);
      const content = vmap.get(resolved) ?? ts.sys.readFile(resolved);
      if (content === undefined) return undefined;
      const sf = ts.createSourceFile(resolved, content, languageVersion);
      // @ts-expect-error
      sf.version = hash(content);
      return sf;
    };

    // Track virtual directories
    const virtualDirs = new Set<string>();
    for (const filePath of vmap.keys()) {
      let dir = path.dirname(filePath);
      while (dir && dir !== projectRoot && dir !== '/') {
        virtualDirs.add(dir);
        dir = path.dirname(dir);
      }
    }
    const originalDirectoryExists: NonNullable<typeof host.directoryExists> =
      host.directoryExists!;
    host.directoryExists = (dirPath: string): boolean => {
      const resolved = path.resolve(dirPath);
      return (
        virtualDirs.has(resolved) ||
        originalDirectoryExists?.call(ts.sys, dirPath)
      );
    };
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
      const resolved = path.resolve(dirPath);
      const virtualFiles = Array.from(vmap.keys())
        .filter((file) => path.dirname(file) === resolved)
        .filter((file) => {
          if (!extensions) return true;
          return extensions.some((ext) => file.endsWith(ext));
        });
      return [...originalResults, ...virtualFiles];
    };

    // Build/check program for this config
    const builder = ts.createIncrementalProgram({
      rootNames: [...config.fileNames, ...vmap.keys()],
      options: {
        ...config.options,
        skipLibCheck: true,
        tsBuildInfoFile: '.tsbuildinfo',
      },
      host,
    });
    const program = builder.getProgram();

    const diagnostics: import('typescript').Diagnostic[] = [];
    for (const absPath of vmap.keys()) {
      const sf = program.getSourceFile(absPath);
      if (sf) diagnostics.push(...ts.getPreEmitDiagnostics(program, sf));
    }
    builder.emit();

    diagnostics.forEach((d) => {
      const fileName = d.file?.fileName;
      if (!fileName || !d.file) return;
      if (!metadataDiagnostic[fileName]) {
        metadataDiagnostic[fileName] = [];
      }
      const msg = ts.flattenDiagnosticMessageText(d.messageText, '\n');
      const { line, character } = d.file.getLineAndCharacterOfPosition(
        d.start!
      );
      metadataDiagnostic[fileName].push({
        type: 'error',
        column: character + 1,
        line: line + 1,
        message: msg,
      });
    });
  }

  // Output
  if (Object.keys(metadataDiagnostic).length === 0) return '{}';
  const transformedKeysToUseRelativePaths = Object.fromEntries(
    Object.entries(metadataDiagnostic).map(([key, content]) => {
      const relativePath = path.relative(projectRoot, key);
      return [relativePath, content] as [string, typeof content];
    })
  );
  return JSON.stringify(transformedKeysToUseRelativePaths);
}
