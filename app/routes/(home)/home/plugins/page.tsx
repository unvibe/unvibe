import { useAPIQuery } from '@/server/api/client';
import { TiPlug } from 'react-icons/ti';

export default function PluginsPage() {
  const { data, isLoading, error } = useAPIQuery('GET /home/info');
  if (isLoading) return <div className='p-10'>Loading plugins...</div>;
  if (error)
    return <div className='p-10 text-red-500'>Failed to load plugins</div>;
  return (
    <div className='p-10'>
      <h1 className='text-3xl font-bold mb-6 flex items-center gap-4'>
        <TiPlug className='w-8 h-8' />
        Plugins
      </h1>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'>
        {data?.plugins?.map((plugin: { id: string }) => (
          <div
            key={plugin.id}
            className='rounded-2xl bg-background-1 hover:bg-background-2 transition-colors p-6 flex flex-col items-start justify-center shadow-sm min-h-[120px] font-mono text-lg'
          >
            <span className='text-blue-500 font-bold'>{plugin.id}</span>
            {/* More plugin info can go here */}
          </div>
        ))}
      </div>
    </div>
  );
}
