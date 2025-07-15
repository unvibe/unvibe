import { TiPlug } from 'react-icons/ti';
import { useProject, useClientPlugins } from '../provider';
import { TbAdjustmentsHorizontal } from 'react-icons/tb';
import { HiUserCircle } from 'react-icons/hi2';
import type { ProjectPlugin } from '@/server/project/types';

export function usePluginsIcons() {
  const clientPlugins = useClientPlugins();
  return (pluginId: string) =>
    clientPlugins.find((p) => p.id === pluginId)?.icon || HiUserCircle;
}

export function SidebarPluginsList() {
  const project = useProject();
  const clientPlugins = useClientPlugins();
  const [core, ...rest] = Object.entries(project.plugins || {}).sort(
    ([, a], [, b]) => {
      return a.id === 'core'
        ? -1
        : b.id === 'core'
          ? 1
          : a.id.localeCompare(b.id);
    }
  );
  const customPlugin = [
    'custom',
    {
      id: 'custom',
      info: {},
      tools: [],
      sourceCodeHooks: [],
    },
  ] as [string, ProjectPlugin];

  return (
    <div className='grid content-start overflow-y-auto h-full w-full'>
      <div className='flex justify-between items-center sticky top-0 bg-background-1 p-2 z-10'>
        <h3 className='flex gap-2 items-center py-1'>
          <TbAdjustmentsHorizontal className='w-6 h-6 text-foreground-2' />
          <span>Context & Tools</span>
        </h3>
      </div>
      <div className='grid content-start gap-1 p-2 pt-0'>
        {[core].map(([pKey, pValue]) => {
          const Icon =
            clientPlugins.find((p) => p.id === pValue.id)?.icon || TiPlug;
          return (
            <div
              key={pKey}
              className='py-0 text-sm capitalize flex items-center gap-3 border-b border-border mb-2 pb-2'
            >
              <span className='p-2 rounded-lg bg-background-2 text-foreground-2'>
                <Icon className='w-4.5 h-4.5' />
              </span>
              <span>{pValue.id}</span>
            </div>
          );
        })}
        {[customPlugin].map(([pKey, pValue]) => {
          const Icon = HiUserCircle;
          return (
            <div
              key={pKey}
              className='py-0 text-sm capitalize flex items-center gap-3 border-b border-border mb-2 pb-2'
            >
              <span className='p-2 rounded-lg bg-background-2 text-foreground-2'>
                <Icon className='w-4.5 h-4.5' />
              </span>
              <span>{pValue.id}</span>
            </div>
          );
        })}
        {rest.map(([pKey, pValue]) => {
          const Icon =
            clientPlugins.find((p) => p.id === pValue.id)?.icon || TiPlug;
          return (
            <div
              key={pKey}
              className='py-0 text-sm capitalize flex items-center gap-3'
            >
              <span className='p-2 rounded-lg bg-background-2 text-foreground-2'>
                <Icon className='w-4.5 h-4.5' />
              </span>
              <span>{pValue.id}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
