// Applies a series of range edits to a file content string.
// Edits: {start, end, content}[] are 1-based inclusive, start/end are line numbers.

export type RangeEdit = { start: number; end: number; content: string };

export function applyRangeEdits(
  fileContent: string,
  edits: RangeEdit[]
): string {
  // Sort edits in reverse order so line numbers remain correct as we splice
  const sorted = [...edits].sort((a, b) => b.start - a.start);
  const lines = fileContent.split('\n');
  for (const edit of sorted) {
    // Remove lines from start-1 to end-1, then insert new content lines at start-1
    const insertAt = Math.max(edit.start - 1, 0);
    const endAt = Math.max(edit.end, insertAt);
    const newLines = edit.content.length ? edit.content.split('\n') : [];
    lines.splice(insertAt, endAt - insertAt, ...newLines);
  }
  return lines.join('\n');
}
