// editor-with-lsp.client.tsx
import { shikiToMonaco } from '@shikijs/monaco';
import Editor from '@monaco-editor/react';
import { createHighlighter } from 'shiki';
import { initVimMode } from 'monaco-vim';
import { useTheme } from '~/modules/root-providers/theme';
import * as React from 'react';

export function MonacoEditorWithLSP({
  content,
  fileName,
  height = '100vh',
  onChange,
  value,
  beforeMonacoMount,
}: {
  content?: string;
  fileName: string;
  height?: string;
  onChange?: (value: string) => void;
  value?: string;
  beforeMonacoMount?: (monaco: any) => void;
}) {
  const [theme] = useTheme();

  // Hold LSP connection for completions, diagnostics, etc
  const lspSocketRef = React.useRef<WebSocket | null>(null);
  const lspPendingCompletions = React.useRef<
    Record<number, (items: any[]) => void>
  >({});
  const lspMsgId = React.useRef(1);

  // Cleanup socket on unmount
  React.useEffect(
    () => () => {
      lspSocketRef.current?.close();
    },
    []
  );

  return (
    <Editor
      height={height}
      defaultValue={content}
      theme={theme.shiki}
      value={value}
      onChange={(value) => {
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

          // We'll use LSP for diagnostics, so keep Monaco silent
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

          // --- LSP WIRING BELOW ---
          // 1. Connect to LSP server
          const ws = new WebSocket('ws://localhost:3007');
          lspSocketRef.current = ws;

          ws.onerror = (event) => {
            console.error('[LSP] WebSocket error:', event);
          };
          ws.onopen = () => {
            // Open file in LSP
            ws.send(
              JSON.stringify({
                jsonrpc: '2.0',
                method: 'textDocument/didOpen',
                params: {
                  textDocument: {
                    uri: `file://${fileName}`,
                    languageId: 'typescript',
                    version: 1,
                    text: editor.getValue(),
                  },
                },
              })
            );
          };

          // 2. Sync changes to LSP
          editor.onDidChangeModelContent(() => {
            ws.send(
              JSON.stringify({
                jsonrpc: '2.0',
                method: 'textDocument/didChange',
                params: {
                  textDocument: { uri: `file://${fileName}`, version: 2 },
                  contentChanges: [{ text: editor.getValue() }],
                },
              })
            );
          });

          // 3. Listen for LSP diagnostics and apply as Monaco markers
          ws.onmessage = (event) => {
            const msg = JSON.parse(event.data);
            console.log('[LSP] Received message:', msg);
            if (msg.method === 'textDocument/publishDiagnostics') {
              const diagnostics = (msg.params?.diagnostics || []).map(
                (diag: any) => ({
                  severity: monaco.MarkerSeverity.Error, // TODO: map LSP severity to Monaco
                  message: diag.message,
                  startLineNumber: diag.range.start.line + 1,
                  startColumn: diag.range.start.character + 1,
                  endLineNumber: diag.range.end.line + 1,
                  endColumn: diag.range.end.character + 1,
                })
              );
              monaco.editor.setModelMarkers(model, 'lsp', diagnostics);
            }
            // 4. Handle LSP completion responses
            if (msg.id && lspPendingCompletions.current[msg.id]) {
              const cb = lspPendingCompletions.current[msg.id];
              delete lspPendingCompletions.current[msg.id];
              const items = msg.result?.items || [];
              cb(items);
            }
          };

          // 5. Register a minimal completion provider using LSP
          monaco.languages.registerCompletionItemProvider('typescript', {
            provideCompletionItems: async (model, position) => {
              const id = lspMsgId.current++;
              ws.send(
                JSON.stringify({
                  jsonrpc: '2.0',
                  id,
                  method: 'textDocument/completion',
                  params: {
                    textDocument: { uri: `file://${fileName}` },
                    position: {
                      line: position.lineNumber - 1,
                      character: position.column - 1,
                    },
                  },
                })
              );
              return new Promise((resolve) => {
                lspPendingCompletions.current[id] = (items) => {
                  resolve({
                    suggestions: (items || []).map((item: any) => ({
                      label: item.label,
                      kind: monaco.languages.CompletionItemKind.Text,
                      insertText: item.insertText || item.label,
                    })),
                  });
                };
              });
            },
          });
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
