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

export type ReplaceFiles = { path: string; content: string }[];

export * from './shared';

export const instructions: string = fs.readFileSync(
  path.join(__dirname, 'instructions.md'),
  'utf8'
);

export async function resolveFiles(
  data: ReplaceFiles,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _source: VirtualFile[]
): Promise<VirtualFile[]> {
  return data;
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
