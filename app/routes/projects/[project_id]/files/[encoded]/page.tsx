import { ThreadInputBox } from '@/modules/project/threads/thread-input-box';
import { resolveHomePath } from '@/server/project/utils';
import fs from 'node:fs/promises';
import path from 'node:path';
import { Route } from './+types/page';
import React from 'react';
import { client } from '@/server/api/client';

const Editor = React.lazy(() =>
  import('@/modules/ui/monaco-editor').then((module) => ({
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
    <div className='overflow-hidden h-full w-full max-w-full max-h-full'>
      <div className='w-full h-full overflow-hidden flex items-stretch max-w-full'>
        <div className='w-[40%] overflow-hidden border-r-2 border-dashed border-border h-full relative'>
          <div></div>
          <div className='absolute bottom-6 inset-x-0 p-2'>
            <ThreadInputBox
              isPending={false}
              placeholder='Continue the conversation...'
            />
          </div>
        </div>
        <div className='w-[60%] h-full overflow-auto'>
          {isClient && (
            <Editor key={filePath} content={content} fileName={filePath} />
          )}
        </div>
      </div>
    </div>
  );
}
