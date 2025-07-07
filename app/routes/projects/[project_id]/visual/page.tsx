import { Route } from './+types/page';
import React from 'react';
import { StartThreadInput } from '~/modules/project/threads/llm-input';
import { noop } from '@/lib/core/noop';
import { MdInfoOutline } from 'react-icons/md';
import { ProjectVisualModeEntry } from '~/modules/project/visual/visual-mode-entrypoint';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function Page(_props: Route.ComponentProps) {
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
        <ProjectVisualModeEntry url='http://localhost:5173' />
      </div>
    </div>
  );
}
