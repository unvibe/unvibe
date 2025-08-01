import { TiPlug } from 'react-icons/ti';
import { usePluginsIcons } from '~/modules/project/plugins-context/sidebar-plugins-list';
import {
  Card,
  getPluginStyle,
} from '~/modules/project/plugins-context/list-card';
import Link from '@/lib/next/link';
import { useAPIQuery } from '@/server/api/client';
import { HomeSectionSharedHeader } from '~/modules/home/home-section-shared-header';
import { HomeSectionSharedLayout } from '~/modules/home/home-section-shared-layout';
import { Button } from '@/lib/ui';
import { HiPlus } from 'react-icons/hi2';
import * as React from 'react';
import { ComingSoonModal } from '~/modules/modals/coming-soon';

export default function PluginsPage() {
  const { data, isLoading, error } = useAPIQuery('GET /home/info');
  const getIcon = usePluginsIcons();
  const [isComingSoonOpen, setIsComingSoonOpen] = React.useState(false);
  const [visiblePlugins, setVisiblePlugins] = React.useState(
    data?.plugins ?? []
  );

  React.useEffect(() => {
    if (data?.plugins) setVisiblePlugins(data.plugins);
  }, [data]);

  if (isLoading) return <div className='p-10'>Loading plugins...</div>;
  if (error) {
    return <div className='p-10 text-red-500'>Failed to load plugins</div>;
  }

  return (
    <HomeSectionSharedLayout>
      <HomeSectionSharedHeader
        Icon={TiPlug}
        sectionDescription='Plugins are extensions that enhance the functionality of Unvibe. You can install, update, and manage plugins from this page.'
        sectionName='Plugins'
        buttons={
          <Button
            variant='secondary'
            className='flex items-center justify-center p-2!'
            title='Add Project'
            onClick={() => setIsComingSoonOpen(true)}
          >
            <HiPlus className='w-6 h-6' />
          </Button>
        }
        values={visiblePlugins}
        setValues={setVisiblePlugins}
        allValues={data?.plugins ?? []}
        getSearchString={(plugin) =>
          plugin.id + ' ' + (plugin.description || '')
        }
      />
      <div className='flex flex-wrap gap-2'>
        {visiblePlugins.map((plugin) => {
          const Icon = getIcon(plugin.id);
          const style = getPluginStyle(plugin.id);
          return (
            <Card key={plugin.id} className='pb-5! min-w-[300px]'>
              <Link
                key={plugin.id}
                href={`/home/plugins/list/${plugin.id}`}
                className='text-sm flex flex-col gap-1 outline-none transition-all'
                style={{ textDecoration: 'none' }}
              >
                <div className='flex items-baseline gap-3'>
                  <div
                    style={style}
                    className='border flex gap-2 items-center p-2 rounded-xl'
                  >
                    <Icon className='w-4.5 h-4.5' />
                  </div>
                  <span className='capitalize text-lg'>
                    {plugin.id.replaceAll('-', ' ')}
                  </span>
                </div>
                <div className='py-2 text-foreground-2'>
                  {plugin.description}
                </div>
              </Link>
            </Card>
          );
        })}
      </div>
      <ComingSoonModal
        onClose={() => setIsComingSoonOpen(false)}
        open={isComingSoonOpen}
        featureHint='Add new plugin'
      />
    </HomeSectionSharedLayout>
  );
}
