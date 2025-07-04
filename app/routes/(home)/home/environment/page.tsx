import { HomeSectionSharedHeader } from '@/modules/home/home-section-shared-header';
import { HomeSectionSharedLayout } from '@/modules/home/home-section-shared-layout';
import { Button } from '@/modules/ui';
import { useAPIQuery } from '@/server/api/client';
import { FaCheckCircle } from 'react-icons/fa';
import { FiEdit } from 'react-icons/fi';
import { HiPlus } from 'react-icons/hi2';
import { TiCogOutline } from 'react-icons/ti';
import * as React from 'react';

export default function EnvironmentPage() {
  const { data, isLoading, error } = useAPIQuery('GET /home/info');
  const [visibleEnv, setVisibleEnv] = React.useState(data?.env ?? []);

  React.useEffect(() => {
    if (data?.env) setVisibleEnv(data.env);
  }, [data]);

  if (isLoading) return <div className='p-10'>Loading environment...</div>;
  if (error)
    return <div className='p-10 text-red-500'>Failed to load environment</div>;
  return (
    <HomeSectionSharedLayout>
      <HomeSectionSharedHeader
        Icon={TiCogOutline}
        sectionName='Environment'
        sectionDescription='Manage environment variables and system settings'
        buttons={
          <Button
            variant='secondary'
            className='flex items-center justify-center p-2!'
            title='Add Project'
          >
            <HiPlus className='w-6 h-6' />
          </Button>
        }
        values={visibleEnv}
        setValues={setVisibleEnv}
        allValues={data?.env ?? []}
        getSearchString={(envVar) => envVar.key + ' ' + envVar.value}
      />
      <div className='flex flex-wrap gap-4'>
        {visibleEnv.map((envVar: { key: string; value: string }) => (
          <div
            key={envVar.key}
            className='flex items-center gap-4 p-4 rounded-xl bg-background-2 min-w-[300px] relative'
          >
            <div className='w-6 h-6 bg-background-1/50 rounded-full flex items-center justify-center'>
              {envVar.value && (
                <FaCheckCircle className='w-5 h-5 text-emerald-600' />
              )}
            </div>
            <div className='grid'>
              <div className='text-sm'>{envVar.key}</div>
              <div className='flex items-center h-[20px] pt-2 text-foreground-2'>
                ********
              </div>
            </div>
            <div className='absolute top-4 right-4 text-foreground-2'>
              <FiEdit className='w-5 h-5' />
            </div>
          </div>
        ))}
      </div>
    </HomeSectionSharedLayout>
  );
}
