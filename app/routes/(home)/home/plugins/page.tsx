import { FiTool } from 'react-icons/fi';
import { MdOutlineIntegrationInstructions } from 'react-icons/md';
import { TbFishHook as TbHook } from 'react-icons/tb';
import { TiPlug } from 'react-icons/ti';
import { usePluginsIcons } from '@/modules/project/plugins-context/sidebar-plugins-list';
import {
  Card,
  PluginIndicator,
} from '@/modules/project/plugins-context/list-card';
import Link from '@/lib/next/link';
import { useAPIQuery } from '@/server/api/client';
import { IconType } from 'react-icons/lib';

function PluginResourceTag({ id, Icon }: { id: string; Icon?: IconType }) {
  return (
    <span className='rounded-full px-2 py-1 bg-background-1/50 whitespace-nowrap flex items-center gap-1 border border-border'>
      {Icon && <Icon className='inline-block w-4 h-4' />}
      {id}
    </span>
  );
}

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
          return (
            <Card key={plugin.id}>
              <Link
                key={plugin.id}
                href={`/home/plugins/list/${plugin.id}`}
                className='text-sm flex flex-col gap-1 outline-none transition-all'
                style={{ textDecoration: 'none' }}
              >
                <Icon className='w-5 h-5 text-foreground-2 absolute bottom-5 right-5' />
                <div className='flex items-center gap-2'>
                  <PluginIndicator name={plugin.id} />
                  <span className='capitalize'>{plugin.id}</span>
                </div>
                <div className='flex gap-1 pt-2 text-xs text-foreground-2 font-mono flex-wrap'>
                  {plugin.metadata?.tools?.length > 0 && (
                    <PluginResourceTag
                      id={`${plugin.metadata.tools.length} tools`}
                      Icon={FiTool}
                    />
                  )}
                  {plugin.metadata?.system?.length > 0 && (
                    <PluginResourceTag
                      id={`${plugin.metadata.system.length} systems`}
                      Icon={MdOutlineIntegrationInstructions}
                    />
                  )}
                  {plugin.metadata?.hooks?.length > 0 && (
                    <PluginResourceTag
                      id={`${plugin.metadata.hooks.length} hooks`}
                      Icon={TbHook}
                    />
                  )}
                </div>
              </Link>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
