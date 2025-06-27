import { Markdown } from '@/modules/markdown/ui/Markdown.client';
import { TbCheck, TbTerminal, TbX } from 'react-icons/tb';
import { ThreadDetailsMessageListItemFile } from './assistant-file';
import type { ModelResponseStructure } from '@/server/llm/structured_output';
import { useAssistantMessageContext } from './assistant-message-context';
import { Button } from '@/modules/ui';
import { useAPIMutation } from '@/server/api/client';
import { Spinner } from '@/modules/ui/spinner';
import { useParams } from '@/lib/next/navigation';

export function StructuredOutput({
  content,
}: {
  content: ModelResponseStructure;
}) {
  const { message, proposed_files, shell_script_exec_request, edits } = content;
  const { state } = useAssistantMessageContext();

  const add = (proposed_files?.add || []).filter(
    (file) => typeof file === 'object' && file.path
  );

  const remove = (proposed_files?.remove || []).filter(
    (file) => typeof file === 'object' && file.path
  );

  const hasProposalFiles = add.length > 0 || remove.length > 0;

  const shellCommandRequests = shell_script_exec_request || [];

  const {
    mutateAsync: runScript,
    isPending,
    isSuccess,
    isError,
  } = useAPIMutation('POST /projects/run-script');
  const projectId = useParams().project_id as string;

  return (
    <div className='grid gap-2'>
      <Markdown text={message} initialHTML={message} />
      {edits?.map((edit) => {
        return (
          <Markdown
            key={edit.path}
            initialHTML={edit.content}
            text={
              '```' + edit.path.split('.').pop() + '\n' + edit.content + '\n```'
            }
          />
        );
      })}
      {hasProposalFiles && (
        <div className='grid gap-2'>
          {add.length > 0 && (
            <div className='font-semibold'>{add.length} files to be added</div>
          )}
          {add.map((file, i) => (
            <ThreadDetailsMessageListItemFile
              key={file.path + i.toString()}
              data={file}
              type='add'
              selected={state?.get()?.added?.[i]?.selected}
              setSelected={(newState) => {
                state.set((prev) => {
                  if (!prev) return prev;
                  return {
                    ...prev,
                    added: prev.added.map((f) =>
                      f.path === file.path ? { ...f, selected: newState } : f
                    ),
                  };
                });
              }}
            />
          ))}
          {remove.length > 0 && <div>{remove.length} files to be removed</div>}
          {remove.map((file, i) => (
            <ThreadDetailsMessageListItemFile
              key={file.path + i.toString()}
              data={file}
              type='remove'
              selected={state.get()?.removed?.[i]?.selected}
              setSelected={(newState) => {
                state.set((prev) => {
                  if (!prev) return prev;
                  return {
                    ...prev,
                    added: prev.added.map((f) =>
                      f.path === file.path ? { ...f, selected: newState } : f
                    ),
                  };
                });
              }}
            />
          ))}
        </div>
      )}
      {shellCommandRequests.length > 0 && (
        <div className='grid gap-2'>
          <div className='font-semibold'>
            {shellCommandRequests.length} shell commands to be executed
          </div>
          <div className='bg-background-1 rounded-2xl p-4'>
            <div className='flex'>
              <div className='p-[2px] border-border mb-2 rounded-lg bg-border'>
                <div className='bg-black rounded-[6px] p-1'>
                  <TbTerminal className='w-5 h-5 text-foreground-2 shrink-0' />
                </div>
              </div>
            </div>
            <div className='flex items-center gap-2 text-xs'>
              <pre className='font-mono'>{shellCommandRequests.join('\n')}</pre>
            </div>
            <div className='flex justify-end mt-1'>
              <Button
                className='text-sm flex items-center justify-center gap-2 border-2!'
                onClick={() => {
                  shellCommandRequests.forEach(async (command) => {
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
      )}
    </div>
  );
}
