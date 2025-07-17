// find_and_replace/index.ts
import {
  StructuredOutputEntry,
  VirtualFile,
} from '@/plugins/_types/plugin.server';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { applyFullFile } from '../utils/apply-full-file';
import { noop } from '@/lib/core/noop';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export type FindAndReplace = {
  path: string;
  search: string;
  replace: string;
  expected_matches?: number;
};
export type FindAndReplaces = FindAndReplace[];
export * from './shared';

export const instructions: string = fs.readFileSync(
  path.join(__dirname, 'instructions.md'),
  'utf8'
);

export async function resolveFiles(
  findReplaces: FindAndReplaces,
  originalFiles: VirtualFile[]
): Promise<VirtualFile[]> {
  const grouped: Record<string, FindAndReplaces> = {};
  for (const fr of findReplaces) {
    grouped[fr.path] = grouped[fr.path] || [];
    grouped[fr.path].push(fr);
  }
  return Object.entries(grouped).map(([path, actions]) => {
    const orig = originalFiles.find((f) => f.path === path);
    if (!orig) {
      // fallback if original file not found
      console.warn(`Original file not found: ${path}`);
      return {
        path,
        content: actions.map((a) => a.replace || '').join('\n'),
      };
    }
    let content = orig.content;
    for (const { search, replace, expected_matches } of actions) {
      const matches = content.split(search).length - 1;
      if (expected_matches !== undefined && matches !== expected_matches)
        continue;
      content = content.split(search).join(replace);
    }
    return { path, content };
  });
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
