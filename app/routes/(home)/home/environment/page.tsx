import { HomeSectionSharedHeader } from '~/modules/home/home-section-shared-header';
import { HomeSectionSharedLayout } from '~/modules/home/home-section-shared-layout';
import { Button } from '@/lib/ui';
import { useAPIQuery } from '@/server/api/client';
import { FaCheckCircle } from 'react-icons/fa';
import { FiEdit } from 'react-icons/fi';
import { HiPlus } from 'react-icons/hi2';
import { TiCogOutline } from 'react-icons/ti';
import * as React from 'react';
import { useLLMModels } from '~/modules/root-providers/llm-models';
import { EnvironmentEditModal } from './EnvironmentEditModal';
import { useEnvironmentStatus } from './useEnvironmentStatus';
import { Alert } from '@/lib/ui/alert';

export default function EnvironmentPage() {
  const { data, isLoading, error } = useAPIQuery('GET /home/info');
  const models = useLLMModels();
  const [visibleEnv, setVisibleEnv] = React.useState(data?.env ?? []);
  const envStatus = useEnvironmentStatus();

  // Modal state
  const [editModalOpen, setEditModalOpen] = React.useState(false);
  const [editingEnv, setEditingEnv] = React.useState<{
    key: string;
    value: string;
  } | null>(null);

  React.useEffect(() => {
    if (data?.env) setVisibleEnv(data.env);
  }, [data]);

  // Open modal with env var
  const handleEditClick = (envVar: { key: string; value: string }) => {
    setEditingEnv(envVar);
    setEditModalOpen(true);
  };

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
      {!envStatus && !isLoading && (
        <Alert variant='warning' className='mb-8 max-w-md' opacity='50'>
          Your environment is not meeting the minimum requirements for Unvibe to
          run properly, you need at lease an API key
        </Alert>
      )}
      <div className='flex flex-wrap gap-4'>
        {visibleEnv.map((envVar: { key: string; value: string }) => (
          <div
            key={envVar.key}
            className='p-4 rounded-xl bg-background-2 min-w-[300px] relative'
          >
            <div className='flex items-center justify-between gap-1'>
              <div className='flex items-center gap-4'>
                <div className='w-6 h-6 bg-background-1/50 rounded-full flex items-center justify-center'>
                  {envVar.value && (
                    <FaCheckCircle className='w-5 h-5 text-emerald-600' />
                  )}
                </div>
                <div className='text-sm'>{envVar.key}</div>
              </div>
              <button
                className='w-6 h-6 rounded-full flex items-center justify-center text-foreground-2 hover:bg-background-1/70 transition'
                onClick={() => handleEditClick(envVar)}
                title='Edit variable'
              >
                <FiEdit className='w-5 h-5' />
              </button>
            </div>
            <div className='flex gap-2 pl-10 items-center text-foreground-2'>
              <div className='flex items-center h-[20px] text-foreground-2 text-xs'>
                {envVar.value
                  ? models.apiKeyProviderMap[envVar.key]
                    ? models.apiKeyProviderMap[envVar.key] + ' models enabled'
                    : '**********'
                  : 'NOT_SET'}
              </div>
            </div>
          </div>
        ))}
      </div>

      <EnvironmentEditModal
        open={editModalOpen}
        envVar={editingEnv}
        onClose={() => setEditModalOpen(false)}
      />
    </HomeSectionSharedLayout>
  );
}
