// edit_instructions/resolve.ts
import { EditInstructions } from './index';

export type VirtualFile = { path: string; content: string };

export async function resolveEditInstructions(
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
