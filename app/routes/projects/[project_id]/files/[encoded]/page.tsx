import { resolveHomePath } from '@/server/project/utils';
import fs from 'node:fs/promises';
import path from 'node:path';
import { Route } from './+types/page';
import React from 'react';
import { client } from '@/server/api/client';
import { StartThreadInput } from '~/modules/project/landing-page/start-thread';
import { noop } from '@/lib/core/noop';
import { MdInfoOutline } from 'react-icons/md';

const Editor = React.lazy(() =>
  import('@/lib/ui/monaco-editor').then((module) => ({
    default: module.MonacoEditor,
  }))
);

export async function loader({ params: p }: Route.LoaderArgs) {
  const decodedPath = decodeURIComponent(p.encoded);
  const filePath = atob(decodedPath);
  console.log('server filePath::', path.basename(filePath));
  const fileAbsolutePath = resolveHomePath(
    path.join(`projects/${p.project_id}`, filePath)
  );
  const content = await fs.readFile(fileAbsolutePath, 'utf-8');
  return {
    content,
    filePath: path.basename(filePath),
  };
}

export async function clientLoader({ params: p }: Route.ClientLoaderArgs) {
  const decodedPath = decodeURIComponent(p.encoded);
  const filePath = atob(decodedPath);
  const result = await client('GET /projects/request-file', {
    filePath,
    projectId: p.project_id,
  });

  console.log('file::', result);
  return {
    content: result.content || '',
    filePath: result.filePath || '',
  };
}

export default function Page({ loaderData }: Route.ComponentProps) {
  const { content, filePath } = loaderData;
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div className='overflow-hidden h-full w-full max-w-full max-h-full flex items-stretch'>
      <div className='w-full p-8 grid content-between h-[100vh] overflow-y-auto overflow-x-hidden max-w-md relative'>
        <div className='h-[calc(100dvh-4rem)] flex items-center justify-center'>
          <div className='flex gap-3 font-mono items-center bg-background-2 p-1 rounded-2xl border border-border pr-4'>
            <div className='p-2 rounded-xl bg-background-1/50'>
              <MdInfoOutline className='w-5 h-5 text-amber-600' />
            </div>
            <span className='text-sm'>Visual workflow is coming soon.</span>
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
        {isClient && (
          <Editor key={filePath} content={content} fileName={filePath} />
        )}
      </div>
    </div>
  );
}
