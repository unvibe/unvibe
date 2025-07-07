// --- Monaco Editor with .d.ts addExtraLib integration ---
import React, { useEffect, useRef, useState } from 'react';
import MonacoEditor, { Monaco } from '@monaco-editor/react';

const DEFAULT_FILE = 'server/index.ts';
const DEFAULT_MODULES = ['react', 'react-dom', 'node'];

function fetchDTS(module: string): Promise<string | null> {
  return fetch(`/api/v2/types-dts?module=${encodeURIComponent(module)}`)
    .then((r) => (r.ok ? r.text() : null))
    .catch(() => null);
}

export default function EditorLSPDemoPage() {
  const monacoRef = useRef<Monaco | null>(null);
  const [code, setCode] = useState<string>('');
  const [status, setStatus] = useState<string>('');

  useEffect(() => {
    fetch(`/api/v1/file?path=${encodeURIComponent(DEFAULT_FILE)}`)
      .then((r) => r.json())
      .then((data) => setCode(data.content ?? '// Failed to load file'));
  }, []);

  async function handleEditorWillMount(monaco: Monaco) {
    monacoRef.current = monaco;
    setStatus('Loading typings...');
    // Inject typings for each module
    for (const mod of DEFAULT_MODULES) {
      const dts = await fetchDTS(mod);
      if (dts) {
        // Use a virtual path that matches the module
        const virtualPath = `file:///node_modules/@types/${mod}/index.d.ts`;
        monaco.languages.typescript.typescriptDefaults.addExtraLib(
          dts,
          virtualPath
        );
      }
    }
    setStatus('Typings loaded.');
  }

  return (
    <div>
      <h2>Monaco Editor + LSP Demo (.d.ts addExtraLib enabled)</h2>
      <div style={{ marginBottom: 8 }}>{status}</div>
      <MonacoEditor
        height='600px'
        defaultLanguage='typescript'
        value={code}
        beforeMount={handleEditorWillMount}
        onChange={(v) => setCode(v ?? '')}
        options={{
          minimap: { enabled: false },
          readOnly: false,
          fontSize: 15,
        }}
      />
    </div>
  );
}
