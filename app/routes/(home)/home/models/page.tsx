import { HomeSectionSharedHeader } from '~/modules/home/home-section-shared-header';
import { HomeSectionSharedLayout } from '~/modules/home/home-section-shared-layout';
import { Button } from '@/lib/ui';
import { useAPIQuery } from '@/server/api/client';
import { HiPlus } from 'react-icons/hi2';
import { TiLightbulb } from 'react-icons/ti';
import * as React from 'react';
import { providerIcons } from '~/modules/project/landing-page/models-selector';

export default function ModelsPage() {
  const { data, isLoading, error } = useAPIQuery('GET /models');
  const [visibleModels, setVisibleModels] = React.useState(() =>
    Object.values(data?.raw || {})
  );
  const allValues = React.useMemo(
    () => Object.values(data?.raw || {}),
    [data?.raw]
  );

  React.useEffect(() => {
    if (data?.raw) setVisibleModels(Object.values(data.raw || {}));
  }, [data]);

  if (isLoading) return <div className='p-10'>Loading environment...</div>;
  if (error)
    return <div className='p-10 text-red-500'>Failed to load environment</div>;

  const groups: Record<string, NonNullable<typeof data>['models']> = {};
  data?.models.forEach((model) => {
    const provider = model.provider || 'Other';
    if (!groups[provider]) groups[provider] = [];
    groups[provider].push(model);
  });

  return (
    <HomeSectionSharedLayout>
      <HomeSectionSharedHeader
        Icon={TiLightbulb}
        sectionName='Models'
        sectionDescription='Manage AI models and configurations'
        buttons={
          <Button
            variant='secondary'
            className='flex items-center justify-center p-2!'
            title='Add Project'
          >
            <HiPlus className='w-6 h-6' />
          </Button>
        }
        values={visibleModels}
        setValues={setVisibleModels}
        allValues={allValues}
        getSearchString={(model) =>
          model.MODEL_CONFIG.id + ' ' + model.MODEL_CONFIG.displayName
        }
      />
      <div>
        {Object.entries(groups).map(([provider, models]) => {
          if (
            !models.some((m) =>
              visibleModels.some((vm) => vm.MODEL_CONFIG.id === m.id)
            )
          ) {
            return null; // Skip empty providers
          }
          return (
            <div key={provider} className='text-foreground-2 mb-4'>
              <h2 className='text-lg font-semibold mb-2 flex items-center gap-3'>
                <span>{providerIcons[provider]}</span>
                <span>{provider}</span>
              </h2>
              <div className='flex flex-wrap gap-4'>
                {models.map((model) =>
                  visibleModels.some((m) => m.MODEL_CONFIG.id === model.id) ? (
                    <div
                      key={model.id}
                      className='p-4 rounded-lg bg-background-1 mb-2 flex items-center justify-between w-[300px] flex-col'
                    >
                      <div className='flex items-center gap-4'>
                        {/* <div className='w-6 h-6 bg-background-1/50 rounded-full flex items-center justify-center'> */}
                        {/* {model.enabled && (
                        <span className='text-green-500'>✓</span>
                      )} */}
                        {/* </div> */}
                        <div className='text-sm'>{model.displayName}</div>
                      </div>
                      <div className='text-xs text-foreground-2'>
                        {model.id}
                      </div>
                    </div>
                  ) : null
                )}
              </div>
            </div>
          );
        })}
      </div>
    </HomeSectionSharedLayout>
  );
}
