import { HomeSectionSharedHeader } from '~/modules/home/home-section-shared-header';
import { HomeSectionSharedLayout } from '~/modules/home/home-section-shared-layout';
import { Button } from '@/lib/ui';
import { useAPIQuery } from '@/server/api/client';
import { HiPlus } from 'react-icons/hi2';
import { TiLightbulb } from 'react-icons/ti';
import * as React from 'react';
import { providerIcons } from '~/modules/project/threads/llm-input/models-selector';

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
        sectionDescription='All available models for use, pricing is per 1M tokens.'
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
                {models.map((model) => {
                  const isVisible = visibleModels.some(
                    (m) => m.MODEL_CONFIG.id === model.id
                  );
                  if (!isVisible) return null; // Skip models not in visibleModels

                  const rawModel = Object.values(data?.raw || {}).find(
                    (m) => m.MODEL_CONFIG.id === model.id
                  );

                  const supports = Object.entries(
                    rawModel?.MODEL_CONFIG.supports || {}
                  )
                    .map(([feature, flag]) => {
                      return flag ? feature : null;
                    })
                    .filter(Boolean);

                  return (
                    <div
                      key={model.id}
                      className='p-4 rounded-2xl bg-background-1 mb-2 flex w-[300px] flex-col'
                    >
                      <div className='flex items-center gap-4'>
                        <div className='text-sm text-foreground'>
                          {model.displayName}
                        </div>
                      </div>
                      <div className='text-xs text-foreground-2 font-mono pt-0.5'>
                        {model.id}
                      </div>
                      <div className='border border-border rounded-xl my-3 text-sm'>
                        <div className='flex items-baseline gap-4 border-b border-border'>
                          <div className='w-1/3 border-r border-border px-2 py-1'>
                            Input
                          </div>
                          <div className='w-2/3 font-mono text-xs'>
                            ${model.pricing.in}
                          </div>
                        </div>
                        <div className='flex items-baseline gap-4 border-b border-border'>
                          <div className='w-1/3 border-r border-border px-2 py-1'>
                            Output
                          </div>
                          <div className='w-2/3 font-mono text-xs'>
                            ${model.pricing.out}
                          </div>
                        </div>
                        <div className='flex items-baseline gap-4'>
                          <div className='w-1/3 border-r border-border px-2 py-1'>
                            Cached
                          </div>
                          <div className='w-2/3 font-mono text-xs'>
                            ${model.pricing.inCached}
                          </div>
                        </div>
                      </div>
                      <div>
                        {supports.map((feature) => {
                          return (
                            <span
                              key={feature}
                              className='inline-block bg-background-2/50 text-foreground-2 rounded-lg px-2 py-1 text-sm mr-1 mt-1'
                            >
                              {feature}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </HomeSectionSharedLayout>
  );
}
