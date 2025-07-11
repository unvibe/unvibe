import { useProject } from '../provider';
import { useRef, useState } from 'react';
import { Button } from '@/lib/ui';
import { ToolParametersRenderer } from './tool-params-renderer';
import { HiPlay } from 'react-icons/hi2';
import { useAPIMutation } from '@/server/api/client';
import { useParams } from '@/lib/next/navigation';
import { parseContext } from './utils';

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

export function ContextItemDetailsTool({
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
        projectId: params.project_id as string,
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
      <div className='p-2 rounded-2xl bg-background-1/50 shrink-0 w-2/4 overflow-hidden h-full'>
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
      <div className='grid h-full p-2 content-start w-2/4 shrink-0 overflow-y-auto text-sm'>
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
        <div className='font-mono overflow-x-auto h-full text-sm'>
          <ContextItemDetailsToolResult output={result} />
        </div>
      </div>
    </div>
  );
}
