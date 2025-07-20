// ast_edit/index.ts
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  StructuredOutputEntry,
  VirtualFile,
} from '@/plugins/_types/plugin.server';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Types ---
export type AstEditQuery = {
  type: 'JSXElement' | 'FunctionDeclaration' | 'VariableDeclaration';
  name: string; // e.g., component/function/variable name
  prop?: string; // for JSX elements
  index?: number; // optional, if more than one target
  // ... more selectors as needed
};

export type AstEditOperation =
  | { operation: 'replace_prop_value'; new_value: string }
  | { operation: 'remove_prop' }
  | { operation: 'replace_node'; new_value: string };

export type AstEdit = {
  path: string;
  query: AstEditQuery;
  operation: AstEditOperation;
};

export type AstEditList = AstEdit[];

export * from './shared';

export const instructions: string = fs.readFileSync(
  path.join(__dirname, 'instructions.md'),
  'utf8'
);

// --- Resolver Placeholder ---
export async function resolveFiles(
  astEdits: AstEditList,
  originalFiles: VirtualFile[]
): Promise<VirtualFile[]> {
  // TODO: implement AST-aware edit logic
  // For now, return originalFiles unchanged
  return originalFiles;
}

// --- Apply Logic (copy from siblings) ---
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
        // applyFullFile(project, entry); // TODO: implement
        status = 'success';
      } catch (error) {
        status = 'error';
      }
      return { path: entry.path, status, payload: '' };
    })
  );
};
