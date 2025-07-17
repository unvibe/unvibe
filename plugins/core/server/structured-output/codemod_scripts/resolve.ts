import _jscodeshift from 'jscodeshift';
import { CodemodScripts } from './index';
import { VirtualFile } from '../edit_instructions/resolve';

// Helper to retrieve file content from the originals
function getOriginalContent(
  path: string,
  originalFiles: VirtualFile[]
): string {
  const found = originalFiles.find((f) => f.path === path);
  if (!found) throw new Error(`Original file not found: ${path}`);
  return found.content;
}

export async function resolveCodemodScripts(
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
