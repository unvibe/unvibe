// UI for dev_propose_only agent, with full code quality check (no continueThread mutation) and custom choices buttons
import { ThreadDetailsMessageCodeQualityCheck } from './assistant-message-run-checks';
import { text } from '@/modules/ui/text';
import { HiArrowPath } from 'react-icons/hi2';
import { ThreadDetailsMessageChoiceButtons } from './assistant-message-actions-buttons-and-modal';
import { useMemo, useState } from 'react';
import { useAPIQuery as useV2Q } from '@/server/api/client';
import { useAPIMutation } from '@/server/api/client';
import clsx from 'clsx';
import { useParams } from '@/lib/next/navigation';
import { useProject } from '@/modules/project/provider';
import { useAssistantMessageContext } from '../assistant-message-context';
import { useStructuredOutputContext } from '../structured-output/context';

export function AssistantMessageActions() {
  const context = useAssistantMessageContext();
  const { data } = useStructuredOutputContext();
  const parsedContent =
    typeof context.metadata?.content === 'string'
      ? undefined
      : context.metadata?.content;
  const threadId = context.metadata.threadId;
  const [diagnostics, setDiagnostics] = useState<
    { name: string; result: string }[]
  >([]);
  const params = useParams();
  const projectId =
    typeof params.project_id === 'string' ? params.project_id : '';
  const addedFiles = data.replace_files || [];
  const removedFiles = data.delete_files || [];

  const { mutate: getDiagnostics, isPending: isCheckingTypeErrors } =
    useAPIMutation('POST /projects/diagnostics');

  const { mutate: continueThread } = useAPIMutation('POST /threads/continue');
  const { refetch } = useV2Q('GET /threads/details', {
    id: threadId,
  });
  const project = useProject();

  const diagnosticChecks = useMemo(() => {
    return Object.values(project.plugins)
      .map((plugin) => {
        return plugin.sourceCodeHooks.filter((d) => d.operations.diagnostic);
      })
      .flat()
      .filter((d) => {
        return addedFiles.some((file) => new RegExp(d.rule).test(file.path));
      });
  }, [project]);

  const runTypeCheck = () => {
    getDiagnostics(
      {
        content: addedFiles.concat(
          removedFiles.map((file) => ({ ...file, content: '' }))
        ),
        source: 'projects',
        projectDirname: projectId,
      },
      {
        onSuccess(data) {
          if (data.result) {
            setDiagnostics(data.result);
          }
        },
        onError(error) {
          console.error('Error checking code validity:', error);
        },
      }
    );
  };

  const feedbackTheError = () => {
    if (!diagnostics) return;

    continueThread(
      {
        threadId,
        prompt: JSON.stringify(diagnostics),
        projectId,
        search_enabled: false,
        images: [],
      },
      {
        onSuccess() {
          refetch();
        },
      }
    );
  };

  const hasChecks = diagnosticChecks.length > 0;

  return (
    <div className='pt-8'>
      <div className='bg-background-1/50 rounded-xl p-5 grid content-start gap-2'>
        <div className='grid content-start gap-2'>
          <div className='flex items-center relative'>
            <text.h3 bold className='text-foreground-2'>
              Your Action is Required
            </text.h3>
            {hasChecks && (
              <div className='absolute top-0 end-0'>
                <button
                  className={clsx(
                    'cursor-pointer p-2 bg-background-1 hover:bg-background-2 rounded-full',
                    isCheckingTypeErrors ? 'animate-spin' : ''
                  )}
                  onClick={() => {
                    runTypeCheck();
                  }}
                >
                  <HiArrowPath className='w-6 h-6 text-foreground-2' />
                </button>
              </div>
            )}
          </div>
          {hasChecks ? (
            <text.p className='text-foreground-2 font-mono text-xs pb-4 max-w-[80%]'>
              {diagnosticChecks.length} checks must run before you can accept
              the proposed changes, (
              {diagnosticChecks.map((d) => d.name).join(', ')})
            </text.p>
          ) : (
            <text.p className='text-foreground-2 font-mono text-xs pb-4 max-w-[80%]'>
              Review the proposed changes before accepting
            </text.p>
          )}
        </div>
        <div className='flex items-center justify-between gap-4'>
          {hasChecks ? (
            <>
              <ThreadDetailsMessageCodeQualityCheck
                isPending={isCheckingTypeErrors}
                diagnostics={diagnostics}
                onClick={() => {
                  // feedback the error
                  if (isCheckingTypeErrors) return;
                  const hasErrors = diagnostics?.some((d) => !!d.result);
                  if (hasErrors) {
                    feedbackTheError();
                  } else {
                    runTypeCheck();
                  }
                }}
              />
              <ThreadDetailsMessageChoiceButtons
                hasChecks={true}
                diagnostics={diagnostics}
                isPending={isCheckingTypeErrors}
              />
            </>
          ) : (
            <>
              <div />
              <ThreadDetailsMessageChoiceButtons
                isPending={false}
                hasChecks={false}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
