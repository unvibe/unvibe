// Monaco LSP Demo with .d.ts addExtraLib integration
import { client } from '@/server/api/client';
import * as React from 'react';
const MonacoEditorWithLSP = React.lazy(() =>
  import('@/lib/ui/monaco-editor/editor-with-lsp.client').then((module) => ({
    default: module.MonacoEditorWithLSP,
  }))
);

const DEMO_FILE_REL_PATH = 'server/index.ts';
const PROJECT_ID = 'unvibe';
const DTS_MODULES = ['react', 'react-dom', 'node', 'hono'];

async function fetchFileContent(projectId: string, filePath: string) {
  const res = await client('GET /projects/request-file', {
    filePath,
    projectId,
  });
  const data = res;
  if (data && data.content) {
    return { content: data.content, filePath };
  } else {
    return {
      content: `Failed to load file: ${filePath}\n${data?.error || ''}`,
      filePath,
    };
  }
}

export default function EditorLspDemoPage() {
  const [code, setCode] = React.useState<string>('Loading...');
  const [filePath, setFilePath] = React.useState<string>(DEMO_FILE_REL_PATH);
  const [isClient, setIsClient] = React.useState(false);
  const [typingsLoaded, setTypingsLoaded] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
    fetchFileContent(PROJECT_ID, DEMO_FILE_REL_PATH)
      .then(({ content, filePath }) => {
        setCode(content);
        setFilePath(filePath);
      })
      .catch((error) => {
        console.error('Failed to fetch file content:', error);
      });
  }, []);

  // Provide typings to Monaco before mount
  const beforeMonacoMount = React.useCallback(async (monaco) => {
    for (const mod of DTS_MODULES) {
      try {
        const r = await client('GET /types-dts', {
          module: encodeURIComponent(mod),
        });
        const { content, found } = r;
        console.log(r);
        if (found && content) {
          const virtualPath = `file:///node_modules/@types/${mod}/index.d.ts`;
          monaco.languages.typescript.typescriptDefaults.addExtraLib(
            content,
            virtualPath
          );
        }
      } catch {}
    }
    setTypingsLoaded(true);
  }, []);

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <h2 style={{ fontWeight: 600, fontSize: 20, margin: '1rem' }}>
        Monaco Editor LSP Demo (with addExtraLib typings)
      </h2>
      <div style={{ margin: 8, color: '#555' }}>
        Typings loaded: {typingsLoaded ? 'yes' : 'no'}
      </div>
      <div style={{ flex: 1 }}>
        {isClient && (
          <React.Suspense fallback={<div>Loading Monaco...</div>}>
            <MonacoEditorWithLSP
              content={code}
              fileName={
                filePath.startsWith('/')
                  ? filePath
                  : `/Users/khaledzakaria/projects/unvibe/${filePath}`
              }
              onChange={setCode}
              height='90vh'
              beforeMonacoMount={beforeMonacoMount}
            />
          </React.Suspense>
        )}
      </div>
    </div>
  );
}
