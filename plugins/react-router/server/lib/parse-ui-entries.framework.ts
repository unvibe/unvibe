// UI Entry parser for Framework mode (no debug logic, preserves traverse workaround)
import * as babel from '@babel/parser';
import _traverse, { NodePath } from '@babel/traverse';
import * as t from '@babel/types';
import type {
  File,
  ExportDefaultDeclaration,
  Node,
  VariableDeclarator,
} from '@babel/types';

type OrigTraverse = typeof _traverse;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const traverse: OrigTraverse = (_traverse as any).default || _traverse;

export interface UIEntry {
  path: string;
  file: string;
}
export interface ProjectFile {
  path: string;
  content: string;
}

function unwrapDeclaration(node: Node): Node {
  if (t.isTSAsExpression(node) || t.isTSSatisfiesExpression(node)) {
    return unwrapDeclaration(node.expression);
  }
  return node;
}

function findVariableInit(ast: File, identifier: string): Node | undefined {
  let found: Node | undefined;
  traverse(ast, {
    VariableDeclarator(path: NodePath<VariableDeclarator>) {
      if (t.isIdentifier(path.node.id) && path.node.id.name === identifier) {
        found = path.node.init ? unwrapDeclaration(path.node.init) : undefined;
        path.stop();
      }
    },
  });
  return found;
}

function extractUIEntriesFromNode(node: Node, entries: UIEntry[]): void {
  if (t.isArrayExpression(node)) {
    node.elements.forEach((el) => {
      if (!el) return;
      if (t.isCallExpression(el)) {
        extractUIEntriesFromNode(el, entries);
      } else if (t.isArrayExpression(el)) {
        extractUIEntriesFromNode(el, entries);
      } else if (t.isSpreadElement(el)) {
        if (t.isCallExpression(el.argument)) {
          extractUIEntriesFromNode(el.argument, entries);
        }
      }
    });
    return;
  }
  if (t.isCallExpression(node)) {
    if (t.isIdentifier(node.callee)) {
      const calleeName = node.callee.name;
      if (calleeName === 'route' && node.arguments.length >= 2) {
        const [pathArg, fileArg] = node.arguments;
        if (t.isStringLiteral(pathArg) && t.isStringLiteral(fileArg)) {
          const url = pathArg.value.startsWith('/')
            ? pathArg.value
            : '/' + pathArg.value;
          const file = './app/' + fileArg.value.replace(/^\.\/?/, '');
          entries.push({ path: url, file });
        }
      } else if (calleeName === 'index' && node.arguments.length === 1) {
        const [fileArg] = node.arguments;
        if (t.isStringLiteral(fileArg)) {
          entries.push({
            path: '/',
            file: './app/' + fileArg.value.replace(/^\.\/?/, ''),
          });
        }
      } else if (calleeName === 'layout' && node.arguments.length >= 2) {
        const childrenArg = node.arguments[1];
        if (t.isArrayExpression(childrenArg)) {
          extractUIEntriesFromNode(childrenArg, entries);
        }
      } else if (calleeName === 'prefix' && node.arguments.length >= 2) {
        const childrenArg = node.arguments[1];
        if (t.isArrayExpression(childrenArg)) {
          extractUIEntriesFromNode(childrenArg, entries);
        }
      }
    }
  }
}

export function parseUIEntriesFramework(files: ProjectFile[]): UIEntry[] {
  const entries: UIEntry[] = [];
  const routesFile = files.find((f: ProjectFile) =>
    f.path.startsWith('./app/routes.ts')
  );
  if (!routesFile) return entries;
  try {
    const ast: File = babel.parse(routesFile.content, {
      sourceType: 'module',
      plugins: ['typescript'],
    }) as File;
    let rootNode: Node | undefined;
    traverse(ast, {
      ExportDefaultDeclaration(path: NodePath<ExportDefaultDeclaration>) {
        const decl = path.node.declaration;
        if (t.isIdentifier(decl)) {
          const resolved = findVariableInit(ast, decl.name);
          if (resolved) rootNode = resolved;
        } else {
          rootNode = unwrapDeclaration(decl);
        }
      },
    });
    if (rootNode) extractUIEntriesFromNode(rootNode, entries);
  } catch {
    // ignore parse errors
  }
  return entries;
}
