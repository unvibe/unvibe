import { shikiToMonaco } from '@shikijs/monaco';
import Editor, { DiffEditor } from '@monaco-editor/react';
import { createHighlighter } from 'shiki';
import { initVimMode } from 'monaco-vim';
import { useTheme } from '~/modules/root-providers/theme';

export function MonacoEditor({
  content,
  fileName,
  height = '100vh',
  onChange,
  value,
  original,
  showInlineDiff = false,
  showSideBySideDiff = false,
}: {
  content?: string;
  fileName: string;
  height?: string;
  onChange?: (value: string) => void;
  value?: string;
  original?: string;
  showInlineDiff?: boolean;
  showSideBySideDiff?: boolean;
}) {
  const [theme] = useTheme();
  if (showInlineDiff || showSideBySideDiff) {
    return (
      <DiffEditor
        key='diff-editor'
        height={height}
        theme={theme.shiki}
        original={original}
        modified={value}
        language='typescript'
        onMount={(_, monaco) => {
          // Create the highlighter, it can be reused
          createHighlighter({
            themes: [theme.shiki],
            langs: ['ts', 'js', 'jsx', 'tsx', 'md'],
          }).then((highlighter) => {
            // Register the languageIds first. Only registered languages will be highlighted.
            monaco.languages.register({
              id: 'typescript',
              aliases: ['ts', 'tsx'],
            });
            monaco.languages.register({
              id: 'javascript',
              aliases: ['js', 'jsx'],
            });
            monaco.languages.register({ id: 'markdown', aliases: ['md'] });
            monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
              jsx: monaco.languages.typescript.JsxEmit.Preserve,
              target: monaco.languages.typescript.ScriptTarget.ES2020,
              esModuleInterop: true,
            });
            // for now let's disable diagnostics
            monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions(
              {
                noSemanticValidation: true,
                noSyntaxValidation: true,
              }
            );
            // Register the themes from Shiki, and provide syntax highlighting for Monaco.
            shikiToMonaco(highlighter, monaco);
          });
        }}
        options={{
          minimap: {
            enabled: false,
          },
          automaticLayout: true,
          originalEditable: false,
          renderSideBySide: false,
          fontSize: 14,
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          wordWrap: 'on',
          wrappingIndent: 'same',
          padding: {
            top: 20,
            bottom: 20,
          },
        }}
      />
    );
  }
  return (
    <Editor
      height={height}
      defaultValue={content}
      theme={theme.shiki}
      value={value}
      onChange={(value) => {
        onChange?.(value || '');
      }}
      onMount={(editor, monaco) => {
        // Create the highlighter, it can be reused
        createHighlighter({
          themes: [theme.shiki],
          langs: ['vue', 'ts', 'js', 'jsx', 'tsx', 'md'],
        }).then((highlighter) => {
          // Register the languageIds first. Only registered languages will be highlighted.
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

          // for now let's disable diagnostics
          monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
            noSemanticValidation: true,
            noSyntaxValidation: true,
          });

          // Register the themes from Shiki, and provide syntax highlighting for Monaco.
          shikiToMonaco(highlighter, monaco);
          const model = monaco.editor.createModel(
            content || '',
            'typescript',
            monaco.Uri.file(fileName)
          );
          editor.setModel(model);
          initVimMode(editor);
        });
      }}
      options={{
        minimap: {
          enabled: false,
        },
        fontSize: 14,
        lineNumbers: 'on',
        scrollBeyondLastLine: false,
        wordWrap: 'on',
        wrappingIndent: 'same',
        padding: {
          top: 20,
          bottom: 20,
        },
      }}
    />
  );
}
