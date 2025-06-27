import { useAPIQuery } from '@/server/api/client';
import { TiBrush } from 'react-icons/ti';

export default function ThemesPage() {
  const { data, isLoading, error } = useAPIQuery('GET /home/info');
  if (isLoading) return <div className='p-10'>Loading themes...</div>;
  if (error)
    return <div className='p-10 text-red-500'>Failed to load themes</div>;
  return (
    <div className='p-10'>
      <h1 className='text-3xl font-bold mb-6 flex items-center gap-4'>
        <TiBrush className='w-8 h-8' />
        Themes
      </h1>
      <div className='flex flex-wrap gap-6 justify-center'>
        {data?.themes?.map((theme: { id: string; name: string }) => (
          <div
            key={theme.id}
            className='rounded-2xl bg-background-1 hover:bg-background-2 transition-colors px-10 py-8 flex flex-col items-center justify-center min-w-[180px] min-h-[120px] font-mono text-lg cursor-pointer'
          >
            <span className='text-blue-500 font-bold'>{theme.name}</span>
            <span className='text-sm text-foreground-2'>{theme.id}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
