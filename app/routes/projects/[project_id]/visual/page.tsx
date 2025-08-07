import { Route } from './+types/page';
import React, { useEffect, useMemo, useState } from 'react';
import { StartThreadInput } from '~/modules/project/threads/llm-input';
import { noop } from '@/lib/core/noop';
import { MdInfoOutline } from 'react-icons/md';
import { ProjectVisualModeEntry } from '~/modules/project/visual/visual-mode-entrypoint';
import { useParams, useSearchParams } from '@/lib/next/navigation';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function Page(_props: Route.ComponentProps) {
  const [searchParams] = useSearchParams();
  const projectId = useParams().project_id as string;

  const [port, setPort] = useState('');
  const [baseUrl, setBaseUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const STORAGE_KEY = useMemo(
    () => `unvibe:visual-port:${projectId}`,
    [projectId]
  );

  // Load saved port (if any)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setPort(saved);
        if (/^\d+$/.test(saved)) {
          setBaseUrl(`http://localhost:${parseInt(saved, 10)}`);
        }
      }
    } catch {}
  }, [STORAGE_KEY]);

  const path = useMemo(() => searchParams.get('path') || '/', [searchParams]);

  const fullUrl = useMemo(() => {
    if (!baseUrl) return null;
    try {
      return new URL(path, baseUrl).toString();
    } catch {
      return null;
    }
  }, [baseUrl, path]);

  function connect() {
    setError(null);
    const trimmed = port.trim();
    if (!/^\d+$/.test(trimmed)) {
      setError('Please enter a valid port number (e.g., 3000, 5173, 8080).');
      setBaseUrl(null);
      return;
    }
    const num = parseInt(trimmed, 10);
    if (num <= 0 || num > 65535) {
      setError('Port must be between 1 and 65535.');
      setBaseUrl(null);
      return;
    }
    const url = `http://localhost:${num}`;
    setBaseUrl(url);
    try {
      localStorage.setItem(STORAGE_KEY, String(num));
    } catch {}
  }

  function clearConfig() {
    setError(null);
    setBaseUrl(null);
    setPort('');
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  }

  return (
    <div className='overflow-hidden h-full w-full max-w-full max-h-full flex items-stretch'>
      <div className='w-full p-8 grid content-between h-[100vh] overflow-y-auto overflow-x-hidden max-w-md relative'>
        <div className='grid gap-4'>
          <div className='bg-background-2 p-3 rounded-2xl border border-border'>
            <div className='flex items-start gap-3'>
              <div className='p-2 rounded-xl bg-background-1/50'>
                <MdInfoOutline className='w-5 h-5 text-amber-600' />
              </div>
              <div className='grid gap-2'>
                <div className='text-sm'>
                  Enter your project's dev server port to enable the visual
                  preview.
                </div>
                <div className='grid gap-2'>
                  <label className='text-xs text-foreground-3'>
                    Dev server port (e.g., 3000, 5173, 8080)
                  </label>
                  <div className='flex items-center gap-2'>
                    <span className='text-sm text-foreground-2'>
                      http://localhost:
                    </span>
                    <input
                      inputMode='numeric'
                      pattern='[0-9]*'
                      className='font-mono w-24 px-2 py-1 rounded border border-border bg-background outline-none'
                      value={port}
                      onChange={(e) => setPort(e.target.value)}
                      placeholder='3000'
                    />
                  </div>
                  {error && <div className='text-xs text-red-500'>{error}</div>}
                  <div className='flex gap-2'>
                    <button
                      className='px-3 py-1 rounded bg-foreground text-background cursor-pointer'
                      onClick={connect}
                    >
                      Connect
                    </button>
                    {baseUrl && (
                      <button
                        className='px-3 py-1 rounded bg-background-2 border border-border cursor-pointer'
                        onClick={clearConfig}
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  {baseUrl && (
                    <div className='text-xs text-foreground-2'>
                      Using base URL:{' '}
                      <span className='font-mono'>{baseUrl}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className='flex gap-3 font-mono items-center bg-background-2 p-1 rounded-2xl border border-border pr-4'>
            <div className='p-2 rounded-xl bg-background-1/50'>
              <MdInfoOutline className='w-5 h-5 text-amber-600' />
            </div>
            <span className='text-sm'>
              Select a route from the sidebar to preview it.
            </span>
          </div>
        </div>
        <div className='pointer-events-none opacity-30 absolute bottom-8 inset-x-8'>
          <StartThreadInput
            isPending={false}
            onSubmit={noop}
            placeholder='Start a thread about this file...'
          />
        </div>
      </div>
      <div className='w-full h-full overflow-hidden flex items-stretch border border-border'>
        {fullUrl ? (
          <ProjectVisualModeEntry url={fullUrl} />
        ) : (
          <div className='w-full h-full grid place-items-center text-foreground-2'>
            Enter your dev server port to enable the preview.
          </div>
        )}
      </div>
    </div>
  );
}
