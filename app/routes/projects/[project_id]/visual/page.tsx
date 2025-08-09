import { Route } from './+types/page';
import React, { useCallback, useEffect } from 'react';
import { StartThreadInput } from '~/modules/project/threads/llm-input';
import { MdCheckCircleOutline, MdEdit, MdInfoOutline } from 'react-icons/md';
import { useParams } from '@/lib/next/navigation';
import { useAPIMutation } from '@/server/api/client';
import { useProject } from '~/modules/project/provider';
import { useNavigate } from 'react-router';
import { useLayoutContext } from './layout-context';
import { captureScreenshot } from '~/modules/project/visual/visual-mode-entrypoint';
import { NPMActionbarSection } from '@/plugins/npm/client/components/npm-actionbar-section';

const CDN_URL = import.meta.env.VITE_CDN_URL;

// Simple matcher: converts ":param" segments to a single path segment matcher
function matchUIEntry(
  entries: { path: string; file: string }[],
  currentPath: string
): { path: string; file: string } | null {
  let best: { entry: { path: string; file: string }; score: number } | null =
    null;
  const normalize = (s: string) =>
    s.endsWith('/') && s !== '/' ? s.slice(0, -1) : s;
  const target = normalize(currentPath || '/');

  for (const entry of entries) {
    const pattern = normalize(entry.path || '/');
    // Build regex: escape regex chars except ':' which we replace with [^/]+
    const reStr =
      '^' +
      pattern
        .replace(/([.+*?^${}()|[\]\\])/g, '\\$1')
        .replace(/:[^/]+/g, '[^/]+') +
      '$';
    const re = new RegExp(reStr);
    if (re.test(target)) {
      // scoring: more static parts => more specific
      const parts = pattern.split('/').filter(Boolean);
      const staticCount = parts.filter((p) => !p.startsWith(':')).length;
      const score = staticCount * 100 + parts.length; // favor more static, then depth
      if (!best || score > best.score) best = { entry, score };
    }
  }
  return best?.entry || null;
}

function ConnectNotice({ onConnected }: { onConnected?: () => void }) {
  const { port, setPort } = useLayoutContext();
  const [internalPort, setInternalPort] = React.useState(port);
  const project_id = useParams().project_id as string;
  return (
    <div className='grid gap-4'>
      <div className='bg-background-2 p-3 rounded-2xl border border-border'>
        <div className='flex items-start gap-3'>
          <div className='p-2 rounded-xl bg-background-1/50'>
            <MdInfoOutline className='w-5 h-5 text-amber-600' />
          </div>
          <div className='grid gap-2'>
            <div className='text-sm'>
              Enter the dev server port for your project to enable the visual
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
                  value={internalPort}
                  onChange={(e) => {
                    setInternalPort(e.target.value);
                    // reset the port if empty
                    setPort('');
                    localStorage.setItem(`visual-port-${project_id}`, '');
                  }}
                  placeholder='3000'
                />
              </div>
              <div className='flex gap-2'>
                <button
                  className='px-3 py-1 rounded bg-foreground text-background cursor-pointer flex items-center gap-2'
                  onClick={() => {
                    setPort(internalPort);
                    localStorage.setItem(
                      `visual-port-${project_id}`,
                      internalPort
                    );
                    onConnected?.();
                  }}
                >
                  {port ? 'Connected' : 'Connect'}
                  {port && <MdCheckCircleOutline className='w-5 h-5' />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Connected({ onEditClicked }: { onEditClicked: () => void }) {
  const { port } = useLayoutContext();
  return (
    <div className='bg-background-2 p-3 rounded-2xl border border-border relative'>
      <div className='flex items-start gap-3'>
        <div className='p-2 rounded-xl bg-background-1/50'>
          <MdCheckCircleOutline className='w-5 h-5 text-green-600' />
        </div>
        <div className='pt-2'>Visual mode is connected at port {port}</div>
      </div>
      <div className='absolute top-3 right-2'>
        <button
          onClick={onEditClicked}
          className='p-2 rounded-xl bg-background-1/50 hover:bg-background-2 transition-colors'
        >
          <MdEdit className='w-5 h-5' />
        </button>
      </div>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function Page(_props: Route.ComponentProps) {
  const projectId = useParams().project_id as string;
  const project = useProject();

  const { pathname, iframeRef, port } = useLayoutContext();
  const url = `http://localhost:${port}${pathname}`;

  // Mutations
  const { mutate: createVisualThread, isPending: isCreating } = useAPIMutation(
    'POST /visual-mode-threads'
  );
  const navigate = useNavigate();
  const uploadURLs = useAPIMutation('POST /upload/request-signed-upload-urls');

  const handleCreate = useCallback(
    async (
      value: Parameters<
        NonNullable<Parameters<typeof StartThreadInput>[0]['onSubmit']>
      >[0]
    ) => {
      const allEntries = Object.values(project.UIEntryPoints).flat();
      const matched = matchUIEntry(allEntries, pathname);

      const header = matched
        ? `UIEntrypoint:\n- path: ${matched.path}\n- file: ${matched.file}\n\n`
        : `UIEntrypoint:\n- path: (unknown)\n- file: (unknown)\n\n`;
      const combinedPrompt = `${header}${value.prompt}`;

      // 2) Capture screenshot and upload to S3 (if possible)
      let screenshotUrl: string | null = null;
      try {
        if (!iframeRef?.current) {
          throw new Error('Iframe reference is not available');
        }
        const blob = await captureScreenshot(iframeRef);
        if (blob && CDN_URL) {
          const key = `uploads/visual-screenshots/${Date.now()}-${Math.random()
            .toString(16)
            .slice(2)}.png`;
          const { signedUploadURLs } =
            (await uploadURLs.mutateAsync({
              files: [{ key, contentType: 'image/png' }],
            })) || {};
          const signed = Array.isArray(signedUploadURLs)
            ? signedUploadURLs[0]
            : undefined;
          if (signed) {
            await fetch(signed, {
              method: 'PUT',
              body: blob,
              headers: { 'Content-Type': 'image/png' },
            });
            screenshotUrl = `${CDN_URL}/${key}`;
          }
        }
      } catch (e) {
        console.error('Screenshot capture/upload failed', e);
      }

      // 3) Compose images list: screenshot first, then any user-attached images
      const images = [screenshotUrl, ...value.images].filter((v): v is string =>
        Boolean(v)
      );

      createVisualThread(
        {
          projectId,
          prompt: combinedPrompt,
          model_id: value.model_id,
          context_config: value.contextConfig,
          images,
        },
        {
          onSuccess: (thread) => {
            navigate(`/projects/${projectId}/visual/${thread.id}`);
          },
        }
      );

      // 5) Clear attachments and prompt locally
      value.clearAttachments();
      value.setPrompt?.('');
    },
    [
      url,
      createVisualThread,
      project.UIEntryPoints,
      projectId,
      uploadURLs,
      pathname,
    ]
  );

  const [hideForm, setHideForm] = React.useState(Boolean(port));

  useEffect(() => {
    setHideForm(Boolean(port));
  }, [port]);
  return (
    <div className='overflow-hidden h-full w-full max-w-full max-h-full flex items-stretch'>
      <div className='w-full pb-8 grid content-between h-[100vh] overflow-y-auto overflow-x-hidden max-w-md relative'>
        {hideForm ? (
          <Connected
            onEditClicked={() => {
              setHideForm(false);
            }}
          />
        ) : (
          <ConnectNotice />
        )}
        <div className='sticky bottom-8 z-50 p-2'>
          <NPMActionbarSection />
          <StartThreadInput
            isPending={isCreating}
            onSubmit={(value) => {
              // Run the async flow separately to keep props signature
              handleCreate(value);
            }}
            placeholder='Describe the change you want to make to this screen...'
          />
        </div>
      </div>
    </div>
  );
}
