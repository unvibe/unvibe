import React, { useState } from 'react';
import { AutogrowTextarea } from '@/lib/ui';

export default function AutogrowTextareaDemoPage() {
  const [value, setValue] = useState('Type here...\nAnd watch me grow!');
  return (
    <main className='min-h-screen flex flex-col items-center justify-start pt-20 bg-background-1 px-4'>
      <h1 className='text-3xl font-bold mb-4'>
        Autogrow Transparant Textarea Demo
      </h1>
      <div className='border border-dashed border-border bg-background-2/60 rounded-xl py-8 px-6 flex flex-col items-center gap-4 min-w-[350px]'>
        <AutogrowTextarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder='Write something...'
          minRows={1}
          maxRows={6}
          style={{ fontSize: 18, width: 320 }} // Demo: apply custom font size/width
        />
        <div className='text-xs mt-2 text-foreground-2'>
          Value:
          <pre className='bg-background-3 p-2 rounded text-[11px] mt-1 max-w-xs overflow-x-auto'>
            {JSON.stringify(value)}
          </pre>
        </div>
        <p className='text-foreground-3 text-[13px]'>
          This textarea blends into any background and auto-expands up to 6
          rows.
        </p>
      </div>
    </main>
  );
}
