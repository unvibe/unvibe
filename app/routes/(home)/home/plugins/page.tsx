import { TiPlug } from 'react-icons/ti';
import { usePluginsIcons } from '@/modules/project/plugins-context/sidebar-plugins-list';
import {
  Card,
  getPluginStyle,
} from '@/modules/project/plugins-context/list-card';
import Link from '@/lib/next/link';
import { useAPIQuery } from '@/server/api/client';

export default function PluginsPage() {
  const { data, isLoading, error } = useAPIQuery('GET /home/info');
  const getIcon = usePluginsIcons();

  if (isLoading) return <div className='p-10'>Loading plugins...</div>;
  if (error) {
    return <div className='p-10 text-red-500'>Failed to load plugins</div>;
  }

  return (
    <div className='p-10'>
      <h1 className='text-3xl font-bold mb-6 flex items-center gap-4'>
        <TiPlug className='w-8 h-8' />
        Plugins
      </h1>
      <div className='flex flex-wrap gap-2'>
        {data?.plugins?.map((plugin) => {
          const Icon = getIcon(plugin.id);
          const style = getPluginStyle(plugin.id);
          return (
            <Card key={plugin.id} className='pb-5!'>
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
                  <span className='capitalize text-lg'>{plugin.id}</span>
                </div>
                <div className='py-2 text-foreground-2'>
                  {plugin.description}
                </div>
              </Link>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
