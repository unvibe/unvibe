import { TiDocumentText } from 'react-icons/ti';

export default function DocsPage() {
  return (
    <div className='p-10'>
      <h1 className='text-3xl font-bold mb-6 flex items-center gap-4'>
        <TiDocumentText className='w-8 h-8' />
        Documentation
      </h1>
      <div className='max-w-2xl mx-auto text-lg text-foreground-2'>
        <p>Documentation and guides will be available here soon.</p>
      </div>
    </div>
  );
}
