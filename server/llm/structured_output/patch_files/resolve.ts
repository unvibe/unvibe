// patch_files/resolve.ts
import { PatchFiles } from './index';
import { VirtualFile } from '../edit_instructions/resolve';
import { applyPatch } from 'diff'; // 'diff' npm package

// Helper to retrieve file content from the originals
function getOriginalContent(
  path: string,
  originalFiles: VirtualFile[]
): string {
  const found = originalFiles.find((f) => f.path === path);
  if (!found) throw new Error(`Original file not found: ${path}`);
  return found.content;
}

export async function resolvePatchFiles(
  patches: PatchFiles,
  originalFiles: VirtualFile[]
): Promise<VirtualFile[]> {
  // 'diff' package applyPatch expects the file as string and a unified diff string
  return patches.map(({ path, patch }) => {
    const original = getOriginalContent(path, originalFiles);
    const newContent = applyPatch(original, patch);
    if (typeof newContent !== 'string')
      throw new Error(`Patch failed for ${path}`);
    return { path, content: newContent };
  });
}
