// edit_instructions/index.ts
import { noop } from '@/lib/core/noop';
import {
  StructuredOutputEntry,
  VirtualFile,
} from '@/plugins/_types/plugin.server';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { applyFullFile } from '../utils/apply-full-file';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export type EditInstruction = {
  path: string;
  action: 'replace' | 'insert' | 'delete';
  start_line: number;
  end_line?: number;
  new_content?: string;
};
export type EditInstructions = EditInstruction[];
export * from './shared';

export const instructions: string = fs.readFileSync(
  path.join(__dirname, 'instructions.md'),
  'utf8'
);

export async function resolveFiles(
  edits: EditInstructions,
  originalFiles: VirtualFile[]
): Promise<VirtualFile[]> {
  const grouped: Record<string, EditInstructions> = {};
  for (const edit of edits) {
    grouped[edit.path] = grouped[edit.path] || [];
    grouped[edit.path].push(edit);
  }
  return Object.entries(grouped).map(([path, actions]) => {
    const orig = originalFiles.find((f) => f.path === path);
    if (!orig) {
      console.warn(`Original file not found: ${path}`);
      return {
        path,
        content: actions.map((a) => a.new_content || '').join('\n'),
      };
    }
    const lines = orig.content.split('\n');
    for (const edit of actions) {
      if (edit.action === 'replace') {
        lines.splice(
          edit.start_line - 1,
          (edit.end_line ?? edit.start_line) - edit.start_line + 1,
          ...(edit.new_content?.split('\n') || [])
        );
      } else if (edit.action === 'insert') {
        lines.splice(
          edit.start_line,
          0,
          ...(edit.new_content?.split('\n') || [])
        );
      } else if (edit.action === 'delete') {
        lines.splice(
          edit.start_line - 1,
          (edit.end_line ?? edit.start_line) - edit.start_line + 1
        );
      }
    }
    return { path, content: lines.join('\n') };
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
