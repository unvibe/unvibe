import { shikiToMonaco } from '@shikijs/monaco';
import Editor from '@monaco-editor/react';
import { createHighlighter } from 'shiki/bundle/web';
import { initVimMode } from 'monaco-vim';

export function MonacoEditor({
  content,
  fileName,
  height = '100vh',
}: {
  content?: string;
  fileName: string;
  height?: string;
}) {
  return (
    <Editor
      height={height}
      defaultValue={content}
      onMount={(editor, monaco) => {
        // Create the highlighter, it can be reused
        createHighlighter({
          themes: ['github-dark'],
          langs: ['javascript', 'typescript', 'vue'],
        }).then((highlighter) => {
          // Register the languageIds first. Only registered languages will be highlighted.
          monaco.languages.register({ id: 'vue' });
          monaco.languages.register({ id: 'typescript' });
          monaco.languages.register({ id: 'javascript' });

          // Register the themes from Shiki, and provide syntax highlighting for Monaco.
          shikiToMonaco(highlighter, monaco);
          const model = monaco.editor.createModel(
            content || '',
            undefined,
            monaco.Uri.file(fileName)
          );

          initVimMode(editor);
          editor.setModel(model);
        });
      }}
      theme='github-dark'
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
