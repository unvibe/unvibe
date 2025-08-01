// editor-with-lsp.client.tsx
import { shikiToMonaco } from '@shikijs/monaco';
import Editor from '@monaco-editor/react';
import { createHighlighter } from 'shiki';
import { initVimMode } from 'monaco-vim';
import { useTheme } from '~/modules/root-providers/theme';
import * as React from 'react';
import { noop } from '@/lib/core/noop';

// function toAbsUri(path: string) {
//   // Ensure file:///abs/path, not file://path
//   if (path.startsWith('file:///')) return path;
//   if (path.startsWith('/')) return `file://${path}`;
//   return `file:///${path}`;
// }

export type Monaco =
  typeof import('/Users/khaledzakaria/projects/unvibe/node_modules/monaco-editor/esm/vs/editor/editor.api');

export function MonacoEditorWithLSP({
  content,
  fileName,
  height = '100vh',
  onChange,
  value,
  beforeMonacoMount,
  projectRoot,
  diagnostics,
}: {
  content?: string;
  fileName: string;
  height?: string;
  onChange?: (value: string) => void;
  value?: string;
  beforeMonacoMount?: (monaco: Monaco) => void;
  projectRoot: string; // Optional, used for LSP initialize
  diagnostics?: { name: string; result: string }[];
}) {
  const [theme] = useTheme();

  return (
    <Editor
      height={height}
      defaultValue={content}
      theme={theme.shiki}
      value={value}
      onChange={(value) => {
        console.log('Monaco value changed:', value);
        onChange?.(value || '');
      }}
      beforeMount={(monaco) => beforeMonacoMount?.(monaco)}
      onMount={(editor, monaco) => {
        createHighlighter({
          themes: [theme.shiki],
          langs: ['vue', 'ts', 'js', 'jsx', 'tsx', 'md'],
        }).then((highlighter) => {
          monaco.languages.register({ id: 'vue' });
          monaco.languages.register({
            id: 'typescript',
            aliases: ['ts', 'tsx'],
          });
          monaco.languages.register({ id: 'javascript' });
          monaco.languages.register({ id: 'markdown' });
          monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
            jsx: monaco.languages.typescript.JsxEmit.Preserve,
            target: monaco.languages.typescript.ScriptTarget.ES2020,
            esModuleInterop: true,
          });
          monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
            noSemanticValidation: true,
            noSyntaxValidation: true,
          });
          shikiToMonaco(highlighter, monaco);
          const model = monaco.editor.createModel(
            content || '',
            'typescript',
            monaco.Uri.file(fileName)
          );
          editor.setModel(model);
          initVimMode(editor);

          // TODO: wire up LSP
          noop(projectRoot);
          const flattedDiagnostics: {
            type: string;
            line: number;
            length?: number; // optional, not always present
            column: number;
            message: string;
          }[] = [];

          diagnostics?.forEach((d) => {
            const result: Record<
              string,
              { type: string; line: number; column: number; message: string }[]
            > = JSON.parse(d.result);
            const firstKey = Object.keys(result)?.[0];
            if (firstKey === undefined) return;
            flattedDiagnostics.push(...result[firstKey]);
          });

          const monacoDiagnostics = flattedDiagnostics?.map((diag) => ({
            severity: monaco.MarkerSeverity.Error, // TODO: map LSP severity to Monaco
            message: diag.message,
            startLineNumber: diag.line,
            startColumn: diag.column,
            endLineNumber: diag.line,
            endColumn: diag.column + (diag.length ?? 1), // Monaco uses 1-based indexing
          }));

          monaco.editor.setModelMarkers(model, 'lsp', monacoDiagnostics || []);
        });
      }}
      options={{
        minimap: { enabled: false },
        fontSize: 14,
        lineNumbers: 'on',
        scrollBeyondLastLine: false,
        wordWrap: 'on',
        wrappingIndent: 'same',
        padding: { top: 20, bottom: 20 },
      }}
    />
  );
}
