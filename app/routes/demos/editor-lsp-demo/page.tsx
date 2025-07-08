// // Monaco LSP Demo with .d.ts addExtraLib integration
// import { useAPIQuery } from '@/server/api/client';
// import * as React from 'react';

// const MonacoEditorWithLSP = React.lazy(() =>
//   import('@/lib/ui/monaco-editor/editor-with-lsp.client').then((module) => ({
//     default: module.MonacoEditorWithLSP,
//   }))
// );

export default function EditorLspDemoPage() {
  // const { data } = useAPIQuery('GET /projects/request-file', {
  //   filePath: './server/index.ts',
  //   projectId: 'unvibe',
  // });
  // const [isClient, setIsClient] = React.useState(false);
  // const [typingsLoaded, setTypingsLoaded] = React.useState(false);

  // React.useEffect(() => {
  //   setIsClient(true);
  // }, []);

  // // Provide typings to Monaco before mount
  // const beforeMonacoMount = React.useCallback(async () => {
  //   setTypingsLoaded(true);
  // }, []);

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <h2 style={{ fontWeight: 600, fontSize: 20, margin: '1rem' }}>
        Monaco Editor LSP Demo (with addExtraLib typings)
      </h2>
      <div style={{ margin: 8, color: '#555' }}>
        {/* Typings loaded: {typingsLoaded ? 'yes' : 'no'} */}
      </div>
      <div style={{ flex: 1 }}>
        {/* {isClient && data?.content && (
          <MonacoEditorWithLSP
            content={data?.content}
            diagnostics={data?.diagnostics}
            projectRoot={'/Users/khaledzakaria/projects/unvibe'}
            fileName='/Users/khaledzakaria/projects/unvibe/server/index.ts'
            onChange={() => {}}
            height='90vh'
            beforeMonacoMount={beforeMonacoMount}
          />
        )} */}
      </div>
    </div>
  );
}
