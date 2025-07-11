// Applies a series of range edits to a file content string.
// Edits: {start, end, content}[] are 1-based inclusive, start/end are line numbers.

import { normalizePath } from '@/server/api/endpoints/projects/utils';
import { Project } from '@/server/project/types';

export type RangeEdit = { start: number; end: number; content: string };

export function applyEdit(
  project: Project,
  file: { path: string; content: string; insert_at: number }
) {
  const source =
    project.EXPENSIVE_REFACTOR_LATER_content[normalizePath(file.path)] || '';
  // todo apply the range to the source
  // Apply the edit by lines
  const sourceLines = source.split('\n');
  const editLines = file.content.split('\n');
  // split the source lines in two parts
  const newLines = [...sourceLines];
  newLines.splice(file.insert_at - 1, 0, ...editLines);
  const appliedContent = newLines.join('\n');
  return {
    path: file.path,
    content: appliedContent,
  };
}

export function applyRangeEdits(
  fileContent: string,
  edits: RangeEdit[]
): string {
  // Sort edits in reverse order so line numbers remain correct as we splice
  const sorted = [...edits].sort((a, b) => b.start - a.start);
  const lines = fileContent.split('\n');

  // Apply edits from bottom up
  let newLines = [...lines];
  for (const edit of sorted) {
    const insertAt = Math.max(edit.start - 1, 0);
    const endAt = Math.max(edit.end, insertAt);
    const replacementLines = edit.content.length
      ? edit.content.split('\n')
      : [];
    newLines = [
      ...newLines.slice(0, insertAt),
      ...replacementLines,
      ...newLines.slice(endAt + 1),
    ];
  }
  return newLines.join('\n');
}
