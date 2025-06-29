import { TbTerminal } from 'react-icons/tb';
import { useStructuredOutputContext } from './context';
import { Checkbox } from '@/modules/ui';

export function StructuredOutputShellScripts() {
  const { data, selection, setSelection } = useStructuredOutputContext();
  const scripts = data.shell_scripts || [];
  // const {
  //   mutateAsync: runScript,
  //   isPending,
  //   isSuccess,
  //   isError,
  // } = useAPIMutation('POST /projects/run-script');
  // const projectId = useParams().project_id as string;

  if (scripts.length === 0) return null;

  return (
    <div className='grid gap-2'>
      <div className='bg-background-1 rounded-2xl p-4 relative'>
        {/* <div className='flex'>
          <div className='p-[2px] border-border mb-2 rounded-lg bg-border'>
            <div className='bg-black rounded-[6px] p-1'>
              <TbTerminal className='w-5 h-5 text-foreground-2 shrink-0' />
            </div>
          </div>
        </div> */}
        <div>
          <TbTerminal className='w-5 h-5 text-foreground-2 shrink-0 mb-4' />
        </div>
        <div className='grid gap-2 text-xs font-mono'>
          {scripts.map((script) => (
            <div key={script} className='flex items-center gap-2'>
              <Checkbox
                className='!w-5 !h-5 !rounded-full shrink-0'
                checked={selection.some((s) => s.path === script && s.selected)}
                onChange={() => {
                  const previous = selection.find((s) => s.path === script);
                  const newState = previous
                    ? { ...previous, selected: !previous.selected }
                    : { path: script, selected: true };

                  setSelection((prev) => {
                    const existingIndex = prev.findIndex(
                      (s) => s.path === script
                    );
                    if (existingIndex !== -1) {
                      const newSelection = [...prev];
                      newSelection[existingIndex] = newState;
                      return newSelection;
                    }
                    return [...prev, newState];
                  });
                }}
              />
              <span>{script}</span>
            </div>
          ))}
        </div>
        {/* <div className='flex justify-end mt-1'>
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
        </div> */}
      </div>
    </div>
  );
}
