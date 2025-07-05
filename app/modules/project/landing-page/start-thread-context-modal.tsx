import { useMemo } from 'react';
import { Modal } from '@/lib/ui/modal';
import clsx from 'clsx';
import { MdOutlineInfo } from 'react-icons/md';
import { Switch } from '@/lib/ui';
import { useProject } from '../provider';
import { HiXMark } from 'react-icons/hi2';
import { getPluginStyle, PluginIcon } from '../plugins-context/list-card';

function SectionCard({
  pluginName,
  contextPartName,
  keys,
  contextConfig,
  updateContextConfig,
}: {
  pluginName: string;
  contextConfig: Record<string, boolean>;
  contextPartName: 'system' | 'tool' | 'hook';
  keys: string[];
  updateContextConfig: (
    source: 'system' | 'tool' | 'hook',
    pluginId: string,
    key: string,
    value: boolean
  ) => void;
}) {
  const style = getPluginStyle(pluginName);
  return (
    <div className={clsx('p-1 bg-background-2 rounded-2xl pb-3')}>
      <h4 className='px-2 py-1 text-foreground-2 capitalize font-semibold text-sm flex items-center gap-2'>
        {/* <PluginIndicator name={pluginName} /> */}
        <div className='p-2 rounded-xl border' style={{ ...style }}>
          <PluginIcon name={pluginName} sizeClassName='w-4 h-4' />
        </div>
        <span>{pluginName}</span>
      </h4>
      {keys.map((name) => {
        const state = contextConfig[`${contextPartName}/${pluginName}/${name}`];
        return (
          <div
            key={name}
            className='px-2 flex items-center justify-between gap-8 w-[300px]'
          >
            <span>{name}</span>
            <span>
              <Switch
                checked={state}
                size='sm'
                onCheckedChange={() => {
                  updateContextConfig(
                    contextPartName,
                    pluginName,
                    name,
                    !state
                  );
                }}
              />
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function StartThreadContextModal({
  setShowContextModal,
  contextConfig,
  updateContextConfig,
}: {
  setShowContextModal: (show: boolean) => void;
  contextConfig: Record<string, boolean>;
  updateContextConfig: (
    source: 'system' | 'tool' | 'hook',
    pluginId: string,
    key: string,
    value: boolean
  ) => void;
}) {
  const project = useProject();

  const toolsGroupByPlugin = useMemo(() => {
    const result: { plugin: string; keys: string[] }[] = [];
    const tools = Object.keys(project.context_config).filter((key) =>
      key.startsWith('tool/')
    );
    for (const toolKey of tools) {
      const [, pluginId, toolName] = toolKey.split('/');
      const existing = result.find((r) => r.plugin === pluginId);
      if (existing) {
        existing.keys.push(toolName);
      } else {
        result.push({ plugin: pluginId, keys: [toolName] });
      }
    }
    return result;
  }, [project.context_config]);

  const systemGroupByPlugin = useMemo(() => {
    const result: { plugin: string; keys: string[] }[] = [];
    const systems = Object.keys(project.context_config).filter((key) =>
      key.startsWith('system/')
    );
    for (const sysKey of systems) {
      const [, pluginId, key] = sysKey.split('/');
      const existing = result.find((r) => r.plugin === pluginId);
      if (existing) {
        existing.keys.push(key);
      } else {
        result.push({ plugin: pluginId, keys: [key] });
      }
    }

    return result;
  }, [project.context_config]);

  const hooksGroupByPlugin = useMemo(() => {
    const result: { plugin: string; keys: string[] }[] = [];
    const systems = Object.keys(project.context_config).filter((key) =>
      key.startsWith('hook/')
    );
    for (const sysKey of systems) {
      const [, pluginId, key] = sysKey.split('/');
      const existing = result.find((r) => r.plugin === pluginId);
      if (existing) {
        existing.keys.push(key);
      } else {
        result.push({ plugin: pluginId, keys: [key] });
      }
    }

    return result;
  }, [project.context_config]);

  return (
    <Modal onClose={() => setShowContextModal(false)}>
      <div className='p-5 grid gap-4 mx-auto w-full'>
        <div className='flex items-center justify-between gap-4'>
          <h2 className='text-2xl font-semibold'>Edit Context</h2>
          <button
            className='p-2 rounded-xl bg-background cursor-pointer'
            onClick={() => setShowContextModal(false)}
          >
            <HiXMark className='w-5 h-5' />
          </button>
        </div>
        <div className='grid gap-1'>
          <div className='flex items-center text-xs gap-3 text-foreground-2'>
            <MdOutlineInfo className='w-4 h-4' />
            <p>changes will be applied to the current thread only</p>
          </div>
        </div>
        <div className='flex items-start gap-4'>
          <div className='grid gap-px'>
            <h3 className='font-semibold mb-2'>Tools</h3>
            {toolsGroupByPlugin.map((c) => {
              return (
                <SectionCard
                  key={c.plugin}
                  pluginName={c.plugin}
                  contextPartName='tool'
                  keys={c.keys}
                  contextConfig={contextConfig}
                  updateContextConfig={updateContextConfig}
                />
              );
            })}
          </div>
          <div className='grid gap-px'>
            <h3 className='font-semibold mb-2'>System</h3>
            {systemGroupByPlugin.map((c) => {
              return (
                <SectionCard
                  key={c.plugin}
                  pluginName={c.plugin}
                  contextPartName='system'
                  keys={c.keys}
                  contextConfig={contextConfig}
                  updateContextConfig={updateContextConfig}
                />
              );
            })}
          </div>
          <div className='grid gap-px'>
            <h3 className='font-semibold mb-2'>Hooks</h3>
            {hooksGroupByPlugin.map((c) => {
              return (
                <SectionCard
                  key={c.plugin}
                  pluginName={c.plugin}
                  contextPartName='hook'
                  keys={c.keys}
                  contextConfig={contextConfig}
                  updateContextConfig={updateContextConfig}
                />
              );
            })}
          </div>
        </div>
      </div>
    </Modal>
  );
}
