import { ComponentProps, ReactNode, useState } from 'react';
import clsx from 'clsx';
import { usePluginsIcons } from './sidebar-plugins-list';
import { Switch } from '@/modules/ui';
import { noop } from '@/lib/core/noop';
import { stringToHue } from '../system/lib/string-to-hue';
import { Modal } from '@/modules/ui/modal';
import { HiPlus } from 'react-icons/hi2';
import { Markdown } from '@/modules/markdown/ui/Markdown.client';
import { parseContext } from './utils';

export function PluginIndicator({ name }: { name: string }) {
  return (
    <span
      className='w-3 h-3 rounded-full border'
      style={getPluginStyle(name)}
    />
  );
}

export function getPluginStyle(name: string) {
  const hue = stringToHue(name);

  if (name === 'custom') {
    return {
      backgroundColor: `hsl(${hue}, 0%, 20%)`,
      borderColor: `hsla(${hue}, 0%, 50%, 0.5)`,
      color: `hsl(${hue}, 0%, 50%)`,
    };
  }
  return {
    backgroundColor: `hsl(${hue}, 50%, 20%)`,
    borderColor: `hsl(${hue}, 50%, 50%)`,
    color: `hsl(${hue}, 50%, 50%)`,
  };
}

export function PluginIcon({
  name,
  sizeClassName = 'w-5 h-5',
}: {
  name: string;
  sizeClassName?: string;
}) {
  const getIcon = usePluginsIcons();
  const Icon = getIcon(name);
  return (
    <div className={clsx('shrink-0', sizeClassName)}>
      <Icon className='w-full h-full' />
    </div>
  );
}
function Card(props: ComponentProps<'div'>) {
  return (
    <div
      {...props}
      className={clsx(
        'p-5 pb-15 w-[250px] bg-background-2 rounded-3xl text-sm relative',
        props.className
      )}
    >
      {props.children}
    </div>
  );
}

export function ContextSectionCard({
  data,
  ViewModal,
}: {
  data: ReturnType<typeof parseContext>[number];
  ViewModal?: ReactNode;
}) {
  const getIcon = usePluginsIcons();
  const Icon = getIcon(data.source_id);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  return (
    <>
      <Card key={data._key}>
        <Icon className='w-5 h-5 text-foreground-2 absolute bottom-5 right-5' />
        <Switch
          size='sm'
          className='absolute bottom-5 left-5'
          checked={true}
          onCheckedChange={noop}
        />
        <div
          className='flex items-center gap-2 cursor-pointer'
          onClick={() => {
            setIsDetailsOpen(true);
          }}
        >
          <PluginIndicator name={data.source_id} />
          <span>{data.key}</span>
        </div>
        <div className='line-clamp-2 pt-2 text-foreground-2 text-sm'>
          {data.description}
        </div>
      </Card>
      {isDetailsOpen && (
        <Modal
          onClose={() => setIsDetailsOpen(false)}
          className='max-w-4xl mx-auto p-5 w-full h-full max-h-[90vh] overflow-hidden'
        >
          <div className='grid content-start w-full h-full max-w-full max-h-full overflow-hidden'>
            <h3 className='text-lg font-semibold pb-2'>{data.key}</h3>
            {data.type === 'system' ? null : (
              <div className='text-sm text-foreground-2 pb-2'>
                <Markdown
                  initialHTML={data.description}
                  text={data.description}
                />
              </div>
            )}
            {ViewModal}
          </div>
        </Modal>
      )}
    </>
  );
}

export function ContextSectionCardAdd({ onClick }: { onClick?: () => void }) {
  return (
    <>
      <button
        className={clsx(
          'w-[250px] min-h-[148px] rounded-3xl text-sm relative cursor-pointer',
          'border-dashed border-2 border-border hover:bg-background-1/50',
          'flex items-center justify-center text-foreground-2'
        )}
        onClick={onClick}
      >
        <div className='border-2 border-border border-dashed p-4 rounded-full'>
          <HiPlus className='w-6 h-6' />
        </div>
      </button>
    </>
  );
}
