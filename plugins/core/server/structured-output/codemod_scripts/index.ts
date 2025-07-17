// codemod_scripts/index.ts
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import _jscodeshift from 'jscodeshift';
import {
  StructuredOutputEntry,
  VirtualFile,
} from '@/plugins/_types/plugin.server';
import { noop } from '@/lib/core/noop';
import { applyFullFile } from '../utils/apply-full-file';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export type CodemodScript = {
  path: string;
  script: string;
};

export type CodemodScripts = CodemodScript[];

export * from './shared';

export const instructions: string = fs.readFileSync(
  path.join(__dirname, 'instructions.md'),
  'utf8'
);

// Helper to retrieve file content from the originals
function getOriginalContent(
  path: string,
  originalFiles: VirtualFile[]
): string {
  const found = originalFiles.find((f) => f.path === path);
  if (!found) throw new Error(`Original file not found: ${path}`);
  return found.content;
}

export async function resolveFiles(
  codemods: CodemodScripts,
  originalFiles: VirtualFile[]
): Promise<VirtualFile[]> {
  const results: VirtualFile[] = [];
  for (const { path, script } of codemods) {
    const ext = path.split('.').pop() || '';

    if (['js', 'ts', 'tsx', 'jsx'].indexOf(ext) === -1)
      throw new Error('Only js/ts codemods supported');

    const source = getOriginalContent(path, originalFiles);
    // Remove any accidental lines that are just a dot (".")
    // Ensure there is NO extra newline between args and body in Function constructor
    const transformer = eval(`(${script})`);

    console.log('-------------------------------------');
    console.log(transformer.toString());
    console.log('-------------------------------------');

    const jscodeshift = _jscodeshift.withParser(
      ext === 'js' || ext === 'jsx' ? 'babylon' : ext
    );

    const out = transformer({ source, path }, { jscodeshift });
    results.push({ path, content: typeof out === 'string' ? out : source });
  }
  return results;
}

export const apply: StructuredOutputEntry['apply'] = async function apply(
  project,
  data,
  selections,
  resolved
) {
  if (!resolved || resolved.length === 0) {
    return [];
  }

  const selected = selections
    ? resolved.filter((file) =>
        selections.some((s) => s.path === file.path && s.selected)
      )
    : resolved;

  return await Promise.all(
    selected.map(async (entry) => {
      let status: 'success' | 'error';
      try {
        await applyFullFile(project, entry);
        status = 'success';
      } catch (error) {
        status = 'error';
        // ignore if file doesn't exist or can't be written
        noop(error);
      }

      return { path: entry.path, status, payload: '' };
    })
  );
};
