import {
  StructuredOutputEntry,
  VirtualFile,
} from '@/plugins/_types/plugin.server';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import fsp from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export * from './shared';

export type DeleteFiles = { path: string }[];

export const instructions: string = fs.readFileSync(
  path.join(__dirname, 'instructions.md'),
  'utf8'
);

export async function resolveFiles(
  data: DeleteFiles,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _source: VirtualFile[]
): Promise<VirtualFile[]> {
  return data.map((p) => ({ path: p.path, content: '' }));
}

export const apply: StructuredOutputEntry['apply'] = async function apply(
  project,
  data,
  selections,
  deleteFiles
) {
  if (!deleteFiles || deleteFiles.length === 0) {
    return [];
  }

  const selected = selections
    ? deleteFiles.filter((file) =>
        selections.some((s) => s.path === file.path && s.selected)
      )
    : deleteFiles;

  return Promise.all(
    selected.map(async (entry) => {
      try {
        await fsp.unlink(path.join(project.path, entry.path));
        return { path: entry.path, status: 'success', payload: '' };
      } catch (error) {
        let payload = '';
        if (error instanceof Error) {
          payload = `Error: ${error.message}`;
        } else if (typeof error === 'string') {
          payload = `Error: ${error}`;
        } else {
          payload = 'Error: An unexpected error occurred: ' + String(error);
        }

        return { path: entry.path, status: 'error', payload: payload };
      }
    })
  );
};
