// UI Entry parser for Declarative mode
import * as babel from '@babel/parser';
import traverse, { NodePath } from '@babel/traverse';
import type { File, JSXOpeningElement } from '@babel/types';
import type { ProjectFile, UIEntry } from './parse-ui-entries.framework';

export function parseUIEntriesDeclarative(files: ProjectFile[]): UIEntry[] {
  const entries: UIEntry[] = [];
  files.forEach((file: ProjectFile) => {
    if (/<Route[\s>]/.test(file.content)) {
      try {
        const ast: File = babel.parse(file.content, {
          sourceType: 'module',
          plugins: ['typescript', 'jsx'],
        }) as File;
        traverse(ast, {
          JSXOpeningElement(path: NodePath<JSXOpeningElement>) {
            if (
              path.node.name.type === 'JSXIdentifier' &&
              path.node.name.name === 'Route'
            ) {
              let url: string | null = null;
              let elem: string | null = null;
              path.node.attributes.forEach((attr) => {
                if (
                  attr.type === 'JSXAttribute' &&
                  attr.name.name === 'path' &&
                  attr.value &&
                  attr.value.type === 'StringLiteral'
                ) {
                  url = attr.value.value.startsWith('/')
                    ? attr.value.value
                    : '/' + attr.value.value;
                }
                if (
                  attr.type === 'JSXAttribute' &&
                  attr.name.name === 'element' &&
                  attr.value &&
                  attr.value.type === 'JSXExpressionContainer'
                ) {
                  if (attr.value.expression.type === 'JSXElement') {
                    const compName = attr.value.expression.openingElement.name;
                    if (compName.type === 'JSXIdentifier') {
                      elem = compName.name;
                    }
                  }
                }
              });
              if (url && elem) {
                const possibleFile = files.find(
                  (f: ProjectFile) =>
                    f.path.endsWith(elem + '.tsx') ||
                    f.path.endsWith(elem + '.jsx')
                );
                if (possibleFile) {
                  entries.push({ path: url, file: possibleFile.path });
                } else {
                  entries.push({ path: url, file: elem });
                }
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
