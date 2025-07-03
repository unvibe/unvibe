import { noop } from '@/lib/core/noop';
import { HomeSectionSharedHeader } from '@/modules/home/home-section-shared-header';
import { HomeSectionSharedLayout } from '@/modules/home/home-section-shared-layout';
import { useAPIQuery } from '@/server/api/client';
import { TiBrush } from 'react-icons/ti';

export default function ThemesPage() {
  const { data, isLoading, error } = useAPIQuery('GET /home/info');
  if (isLoading) return <div className='p-10'>Loading themes...</div>;
  if (error)
    return <div className='p-10 text-red-500'>Failed to load themes</div>;
  return (
    <HomeSectionSharedLayout>
      <HomeSectionSharedHeader
        Icon={TiBrush}
        search=''
        setSearch={noop}
        sectionName='Themes'
        sectionDescription='Themes allow you to customize the appearance of Unvibe. You can create, edit, and delete themes from this page.'
      />
      <div className='flex flex-wrap gap-4'>
        {data?.themes?.map((theme: { id: string; name: string }) => (
          <div
            key={theme.id}
            className='rounded-4xl bg-background-1 hover:bg-background-2 transition-colors px-10 py-8 flex flex-col items-center justify-center min-w-[180px] min-h-[120px] font-mono text-lg cursor-pointer'
          >
            <span className='text-blue-500 font-bold'>{theme.name}</span>
            <span className='text-sm text-foreground-2'>{theme.id}</span>
          </div>
        ))}
      </div>
    </HomeSectionSharedLayout>
  );
}
