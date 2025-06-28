import type { ModelResponseStructure } from '@/server/llm/structured_output';
import { Button } from '@/modules/ui/button';
import { Spinner } from '@/modules/ui/spinner';
import { Modal } from '@/modules/ui/modal';
import { Alert, variantIcons } from '@/modules/ui/alert';
import { FaTerminal } from 'react-icons/fa';
import { useStructuredOutputContext } from '../structured-output/context';

export function ConfirmModal({
  closeModal,
  isRunningCommands,
  isWritingFiles,
  isDangerous,
  writeFiles,
  installPackages,
  diagnostics,
}: {
  closeModal: () => void;
  isRunningCommands?: boolean;
  isWritingFiles?: boolean;
  isDangerous?: boolean;
  writeFiles: () => void;
  installPackages: () => void;
  diagnostics?: { name: string; result: string }[];
}) {
  const { data } = useStructuredOutputContext();
  const hasPackages = false;
  const hasProposalFiles = Boolean(
    data.replace_files?.length || data?.delete_files?.length
  );

  const hasErrors = diagnostics?.some((d) => !!d.result);

  console.log('modal', diagnostics);

  return (
    <Modal onClose={closeModal}>
      <div className='max-w-xl mx-auto'>
        <Alert
          heading={
            hasPackages && !hasProposalFiles
              ? 'Run Shell Script'
              : 'Warning: Checks Not Passed'
          }
          variant={hasPackages && !hasProposalFiles ? 'info' : 'warning'}
          opacity='0'
          className='w-full p-5!'
        >
          <div className='text-sm'>
            {hasPackages && !hasProposalFiles
              ? 'Shell script will be run to install/uninstall packages'
              : 'One or more code quality checks have failed. Are you sure you want to apply these changes?'}
          </div>
        </Alert>
        {hasErrors && (
          <div>
            {diagnostics
              ?.filter((d) => !!d.result)
              .map((d) => {
                return (
                  <div
                    key={d.name}
                    className='w-full bg-amber-950 text-amber-400 p-5 font-mono text-xs max-w-full grid content-start max-h-[300px] overflow-y-auto whitespace-pre-wrap'
                  >
                    <div className='font-bold'>{d.name}</div>
                    {d.result.split('\n').map((line, index) => {
                      return <div key={line + index}>{line}</div>;
                    })}
                  </div>
                );
              })}
          </div>
        )}
        <div className='flex items-center justify-between gap-4 p-4 text-sm'>
          <Button variant='secondary' onClick={closeModal}>
            <span className='h-[22px] flex items-center'>Cancel</span>
          </Button>
          <div className='flex items-center gap-4'>
            {!hasPackages ? null : (
              <Button
                variant={'default'}
                disabled={isRunningCommands}
                onClick={installPackages}
                className='flex items-center gap-2'
              >
                <span>
                  {isRunningCommands ? (
                    <Spinner className='w-[22px] h-[22px]' />
                  ) : (
                    <FaTerminal className='w-[22px] h-[22px]' />
                  )}
                </span>
                <span>Run Script</span>
              </Button>
            )}
            {!hasProposalFiles ? null : (
              <Button
                variant={isDangerous ? 'error' : 'warning'}
                disabled={isWritingFiles}
                onClick={writeFiles}
                className='flex items-center gap-2'
              >
                <span>{variantIcons.info}</span>
                <span>Apply Anyway</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
