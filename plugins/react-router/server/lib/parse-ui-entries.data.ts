// UI Entry parser for Data mode
import * as babel from '@babel/parser';
import traverse, { NodePath } from '@babel/traverse';
import type { File, ObjectExpression } from '@babel/types';
import type { ProjectFile, UIEntry } from './parse-ui-entries.framework';

export function parseUIEntriesData(files: ProjectFile[]): UIEntry[] {
  const entries: UIEntry[] = [];
  files.forEach((file: ProjectFile) => {
    if (/createBrowserRouter\s*\(/.test(file.content)) {
      try {
        const ast: File = babel.parse(file.content, {
          sourceType: 'module',
          plugins: ['typescript', 'jsx'],
        }) as File;
        traverse(ast, {
          ObjectExpression(objPath: NodePath<ObjectExpression>) {
            let pathStr: string | null = null;
            let elementStr: string | null = null;
            objPath.node.properties.forEach((prop) => {
              if (
                prop.type === 'ObjectProperty' &&
                prop.key.type === 'Identifier'
              ) {
                if (
                  prop.key.name === 'path' &&
                  prop.value.type === 'StringLiteral'
                ) {
                  pathStr = prop.value.value.startsWith('/')
                    ? prop.value.value
                    : '/' + prop.value.value;
                }
                if (
                  (prop.key.name === 'element' ||
                    prop.key.name === 'Component') &&
                  prop.value.type === 'Identifier'
                ) {
                  elementStr = prop.value.name;
                }
              }
            });
            if (pathStr && elementStr) {
              const possibleFile = files.find(
                (f: ProjectFile) =>
                  f.path.endsWith(elementStr + '.tsx') ||
                  f.path.endsWith(elementStr + '.jsx')
              );
              if (possibleFile) {
                entries.push({ path: pathStr, file: possibleFile.path });
              } else {
                entries.push({ path: pathStr, file: elementStr });
              }
            }
          },
        });
      } catch {
        // ignore parse errors
      }
    }
  });
  return entries;
}
