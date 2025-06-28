import { TbCheck, TbTerminal, TbX } from 'react-icons/tb';
import { useStructuredOutputContext } from './context';
import { Button } from '@/modules/ui';
import { useAPIMutation } from '@/server/api/client';
import { useParams } from '@/lib/next/navigation';
import { Spinner } from '@/modules/ui/spinner';

export function StructuredOutputShellScripts() {
  const { data } = useStructuredOutputContext();
  const scripts = data.shell_scripts || [];
  const {
    mutateAsync: runScript,
    isPending,
    isSuccess,
    isError,
  } = useAPIMutation('POST /projects/run-script');
  const projectId = useParams().project_id as string;

  if (scripts.length === 0) return null;

  return (
    <div className='grid gap-2'>
      <div className='bg-background-1 rounded-2xl p-4'>
        <div className='flex'>
          <div className='p-[2px] border-border mb-2 rounded-lg bg-border'>
            <div className='bg-black rounded-[6px] p-1'>
              <TbTerminal className='w-5 h-5 text-foreground-2 shrink-0' />
            </div>
          </div>
        </div>
        <div className='flex items-center gap-2 text-xs'>
          <pre className='font-mono'>{scripts.join('\n')}</pre>
        </div>
        <div className='flex justify-end mt-1'>
          <Button
            className='text-sm flex items-center justify-center gap-2 border-2!'
            onClick={() => {
              scripts.forEach(async (command) => {
                await runScript({
                  args: [],
                  command,
                  projectDirname: projectId,
                  source: 'projects',
                });
              });
            }}
          >
            <span>
              {isPending ? (
                <Spinner className='w-4 h-4' />
              ) : isSuccess ? (
                <TbCheck className='w-4 h-4' />
              ) : isError ? (
                <TbX className='w-4 h-4 text-red-500' />
              ) : (
                <TbTerminal className='w-4 h-4' />
              )}
            </span>
            <span>Run Script</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
