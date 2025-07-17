// find_and_replace/resolve.ts
import { FindAndReplaces } from './index';

export type VirtualFile = { path: string; content: string };

export async function resolveFindAndReplace(
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
