import { useState } from 'react';
import { EditableText } from '@/lib/ui';

export default function UILibraryLanding() {
  const [demoValue, setDemoValue] = useState('I am an editable text!');
  const [isEdit, setIsEdit] = useState(false);

  return (
    <div className='container mx-auto py-16 px-8'>
      <h1 className='text-5xl font-bold mb-4'>UI Component Library Demos</h1>
      <p className='text-lg text-foreground-2 mb-10 max-w-2xl'>
        Welcome to the UI components demo suite! Explore interactive demos of
        our design system&apos;s React components, including buttons, alerts,
        tables, modals, and more. Use the sidebar to try out each component and
        see usage examples, all in one place.
      </p>
      <div className='rounded-xl p-10 bg-background-2/70 border border-border shadow-xl mb-8'>
        <h2 className='text-2xl font-semibold mb-2'>
          🎨 Browse the sidebar to view component demos!
        </h2>
        <ul className='list-disc list-inside text-foreground-2 mt-4 space-y-1'>
          <li>See live examples and best practices for each component.</li>
          <li>Compare variations, props, and interactive states.</li>
          <li>Use as a reference while building your app UI.</li>
        </ul>
      </div>

      {/* EditableText Demo */}
      <div className='mb-8'>
        <h3 className='text-xl font-semibold mb-2'>📝 EditableText Demo</h3>
        <div className='bg-background-1 border border-border-1 rounded-lg p-6 shadow-md w-full max-w-xs'>
          <EditableText
            value={demoValue}
            onChange={setDemoValue}
            isEdit={isEdit}
            setIsEdit={setIsEdit}
          />
          <p className='mt-3 text-foreground-2 text-xs'>
            Value:{' '}
            <span className='font-mono bg-background-2 px-1 py-0.5 rounded'>
              {demoValue}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
