import { useProject } from '../provider';
import { ComponentProps, useCallback, useRef, useState } from 'react';
import clsx from 'clsx';
import { usePluginsIcons } from './sidebar-plugins-list';
import { Button, Switch } from '@/modules/ui';
import { noop } from '@/lib/core/noop';
import { stringToHue } from '../system/lib/string-to-hue';
import { Modal } from '@/modules/ui/modal';
import { ToolParametersRenderer } from './tool-params-renderer';
import { HiPlay, HiPlus } from 'react-icons/hi2';
import { Markdown } from '@/modules/markdown/ui/Markdown.client';
import { useAPIMutation } from '@/server/api/client';
import { useParams } from '@/lib/next/navigation';
import { MonacoEditor } from '@/modules/ui/monaco-editor';

// 1. display each plugin tool (from project.tools)
// 2. display each plugin system-part (from getContext)
// 3. display each plugin proposal hook (from project.proposalHooks)

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

function SectionHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className='w-[250px] px-4'>
      <h3 className='text-2xl font-semibold'>{title}</h3>
      <p className='text-sm text-foreground-2 py-2'>{description}</p>
    </div>
  );
}

function Section({
  children,
  title,
  description,
}: {
  children: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className='grid gap-1'>
      <SectionHeader title={title} description={description} />
      <div className='flex flex-wrap gap-2'>{children}</div>
    </div>
  );
}

function parseContext(context: { key: string; preview_string: string }[]) {
  return context.map((item) => {
    const [type, source_id, key] = item.key.split('/');
    return {
      _key: item.key,
      type,
      source_id,
      key,
      description: item.preview_string,
    };
  });
}

function ContextItemDetailsHook({
  data,
}: {
  data: ReturnType<typeof parseContext>[number];
}) {
  return (
    <pre className='bg-background-3 p-4 rounded-md'>
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}

function ContextItemDetailsToolResult({ output }: { output: unknown }) {
  if (!output) {
    return <div>No result</div>;
  }

  if (typeof output === 'string') {
    return <pre className='bg-background-3 p-4 rounded-md'>{output}</pre>;
  }

  if (output && typeof output === 'object') {
    return (
      <pre className='bg-background-3 p-4 rounded-md'>
        {JSON.stringify(output, null, 2)}
      </pre>
    );
  }

  return <div>No result</div>;
}

function ContextItemDetailsTool({
  data,
}: {
  data: ReturnType<typeof parseContext>[number];
}) {
  const project = useProject();
  const tool = project.plugins[data.source_id].tools.find(
    (t) => t.name === data.key
  );
  const [form, setForm] = useState<Record<string, unknown>>({});
  const [result, setResult] = useState<unknown>(null);
  const toolCall = useAPIMutation('POST /tools-tester/call');
  const params = useParams();

  async function handleSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!tool) return;
    setResult(null);
    try {
      const resp = await toolCall.mutateAsync({
        tool: tool.name as string,
        args: form,
        source: 'projects',
        projectDirname: params.project_id as string,
      });
      setResult(resp?.result);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Tool call failed';
      setResult({ error: message || 'Tool call failed' });
    }
  }
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <div className='flex items-stretch gap-4 bg-background-2 rounded-3xl p-2 w-full max-h-full overflow-hidden h-full'>
      <div className='p-2 rounded-2xl bg-background-1/50 shrink-0 w-1/4 overflow-hidden h-full'>
        <div className='font-mono px-4'>Parameters</div>
        <form
          className='grid content-start max-h-full py-4 h-full overflow-y-auto'
          onSubmit={handleSubmit}
          ref={formRef}
        >
          <ToolParametersRenderer
            params={tool?.parameters}
            form={form}
            setForm={setForm}
          />
        </form>
      </div>
      <div className='grid h-[50vh] p-2 content-start w-3/4 shrink-0 overflow-y-auto'>
        <div className='flex items-center justify-between pr-4 relative'>
          <div className='font-mono'>Output</div>
          <Button
            className='text-xs flex items-center gap-2 absolute right-2 px-3! py-2! font-mono'
            variant='info'
            onClick={() => {
              formRef.current?.requestSubmit();
            }}
          >
            <span>
              <HiPlay className='w-4 h-4' />
            </span>
            <span>Run</span>
          </Button>
        </div>
        <div className='font-mono overflow-x-auto h-full'>
          <ContextItemDetailsToolResult output={result} />
        </div>
      </div>
    </div>
  );
}

function ContextItemDetailsSystem({
  data,
}: {
  data: ReturnType<typeof parseContext>[number];
}) {
  const setupHeight = useCallback((node: HTMLDivElement | null) => {
    if (!node) return;
    (node.childNodes[0] as HTMLElement).style.height = `${node.clientHeight}px`;
  }, []);

  return (
    <div
      className='w-full h-full overflow-hidden bg-blue-200'
      ref={setupHeight}
    >
      <MonacoEditor fileName={data.key} content={data.description} />;
    </div>
  );
}

function ContextItemDetails({
  data,
}: {
  data: ReturnType<typeof parseContext>[number];
}) {
  return (
    <div className='grid content-start w-full h-full max-w-full max-h-full overflow-hidden'>
      <h3 className='text-lg font-semibold pb-2'>{data.key}</h3>
      {data.type === 'system' ? null : (
        <div className='text-sm text-foreground-2 pb-2'>
          <Markdown initialHTML={data.description} text={data.description} />
        </div>
      )}
      {data.type === 'tool' && <ContextItemDetailsTool data={data} />}
      {data.type === 'hook' && <ContextItemDetailsHook data={data} />}
      {data.type === 'system' && <ContextItemDetailsSystem data={data} />}
    </div>
  );
}

function ContextItemDetailsModal({
  data,
  closeModal,
}: {
  data: ReturnType<typeof parseContext>[number];
  closeModal: () => void;
}) {
  return (
    <Modal
      onClose={closeModal}
      className='max-w-4xl mx-auto p-5 w-full h-full max-h-[90vh] overflow-hidden'
    >
      <ContextItemDetails data={data} />
    </Modal>
  );
}

export function PluginIndicator({ name }: { name: string }) {
  const hue = stringToHue(name);
  const customStyles = {
    backgroundColor: `hsl(${hue}, 0%, 20%)`,
    borderColor: `hsl(${hue}, 0%, 50%)`,
  };
  const computedStyles = {
    backgroundColor: `hsl(${hue}, 50%, 20%)`,
    borderColor: `hsl(${hue}, 50%, 50%)`,
  };
  return (
    <span
      className='w-3 h-3 rounded-full border'
      style={name === 'custom' ? customStyles : computedStyles}
    />
  );
}

function ContextSectionCard({
  data,
}: {
  data: ReturnType<typeof parseContext>[number];
}) {
  const getIcon = usePluginsIcons();
  const Icon = getIcon(data.source_id);
  const hue = stringToHue(data.source_id);
  const customStyles = {
    backgroundColor: `hsl(${hue}, 0%, 20%)`,
    borderColor: `hsl(${hue}, 0%, 50%)`,
  };
  const computedStyles = {
    backgroundColor: `hsl(${hue}, 50%, 20%)`,
    borderColor: `hsl(${hue}, 50%, 50%)`,
  };
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
          <span
            className='w-3 h-3 rounded-full border'
            style={data.source_id === 'custom' ? customStyles : computedStyles}
          />
          <span>{data.key}</span>
        </div>
        <div className='line-clamp-2 pt-2 text-foreground-2 text-sm'>
          {data.description}
        </div>
      </Card>
      {isDetailsOpen && (
        <ContextItemDetailsModal
          data={data}
          closeModal={() => setIsDetailsOpen(false)}
        />
      )}
    </>
  );
}

function ContextSectionCardAdd() {
  return (
    <>
      <button
        className={clsx(
          'w-[250px] rounded-3xl text-sm relative cursor-pointer',
          'border-dashed border-2 border-border hover:bg-background-1/50',
          'flex items-center justify-center text-foreground-2'
        )}
      >
        <div className='border-2 border-border border-dashed p-4 rounded-full'>
          <HiPlus className='w-6 h-6' />
        </div>
      </button>
    </>
  );
}

export function PluginList() {
  const contextPreview = useProject().context_preview;
  const parsed = parseContext(contextPreview);
  const _tools = parsed.filter((item) => item.type === 'tool');
  const _systems = parsed.filter((item) => item.type === 'system');
  const _hooks = parsed.filter((item) => item.type === 'hook');

  return (
    <main className='p-8 max-w-6xl mx-auto'>
      <div className='gap-8 grid content-start'>
        <Section title='Tools' description='LLM tools'>
          {_tools.map((tool) => {
            return <ContextSectionCard key={tool._key} data={tool} />;
          })}
          <ContextSectionCardAdd />
        </Section>
        <Section title='System' description='LLM system instructions'>
          {_systems?.map((system) => {
            return <ContextSectionCard key={system._key} data={system} />;
          })}
          <ContextSectionCardAdd />
        </Section>
        <Section title='Hooks' description='LLM structured output hooks'>
          {_hooks.map((hook) => {
            return <ContextSectionCard key={hook._key} data={hook} />;
          })}
          <ContextSectionCardAdd />
        </Section>
      </div>
    </main>
  );
}
