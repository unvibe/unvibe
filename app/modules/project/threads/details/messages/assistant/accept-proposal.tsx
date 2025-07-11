import {
  MdOutlineDownloading,
  MdOutlinePlayArrow,
  MdRefresh,
} from 'react-icons/md';
import { useAssistantMessageContext } from './assistant-message-context';
import { useStructuredOutputContext } from './structured-output/context';
import { useAPIMutation, useAPIQuery } from '@/server/api/client';
import { useParams } from 'react-router';
import { Spinner } from '@/lib/ui/spinner';

function ProposalButton({
  label,
  icon: Icon,
  className,
  onClick,
  isLoading = false,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  className?: string;
  onClick?: () => void;
  isLoading?: boolean;
}) {
  return (
    <button
      className={`font-mono text-xs p-1 px-3 rounded-lg flex items-center gap-2 cursor-pointer ${className}`}
      onClick={onClick}
    >
      <span>
        {isLoading ? (
          <Spinner className='w-5 h-5' />
        ) : (
          <Icon className='w-5 h-5' />
        )}
      </span>
      <span>{label}</span>
    </button>
  );
}

export function AcceptProposal() {
  // get if there are any errors in any of the selected files
  const messageContext = useAssistantMessageContext();
  const structuredOutputContext = useStructuredOutputContext();
  const replaced = structuredOutputContext.data.replace_files || [];
  const edited = structuredOutputContext.data.edit_files || [];
  const deleted = structuredOutputContext.data.delete_files || [];
  const scripts = structuredOutputContext.data.shell_scripts || [];
  const rangeEdits = structuredOutputContext.data.edit_ranges || [];

  const hasNoFilesAndNoScripts =
    replaced.length === 0 &&
    edited.length === 0 &&
    deleted.length === 0 &&
    scripts.length === 0 &&
    rangeEdits.length === 0;

  const metadata = messageContext.message.metadata;
  const hasIssues = metadata
    ? Object.values(metadata.diagnostics).some((record) =>
        Object.values(record).some((ds) => ds.some((m) => !!m.type))
      )
    : false;

  const { mutate: applyProposal, isPending: isApplyingProposal } =
    useAPIMutation('POST /projects/accept-proposal');
  const { mutate: continueThread, isPending: isContinuingThread } =
    useAPIMutation('POST /threads/continue');
  const projectId = useParams().project_id as string;
  const { data: thread, refetch } = useAPIQuery('GET /threads/details', {
    id: messageContext.message.thread_id,
  });

  return (
    <div className='flex items-center justify-end pt-4 pb-2 gap-4'>
      {hasNoFilesAndNoScripts ? (
        <ProposalButton
          label='Continue'
          icon={MdOutlinePlayArrow}
          className='bg-sky-800 text-sky-50'
          isLoading={false}
        />
      ) : (
        <>
          {!hasIssues && (
            <>
              <ProposalButton
                label='Accept & continue'
                icon={MdOutlinePlayArrow}
                className='bg-background-1 text-foreground-2'
                isLoading={isApplyingProposal || isContinuingThread}
                onClick={() => {
                  applyProposal(
                    {
                      id: projectId,
                      selections: structuredOutputContext.selection,
                      proposal: {
                        messageId: messageContext.message.id,
                        ...structuredOutputContext.data,
                      },
                    },
                    {
                      onSuccess(data) {
                        continueThread(
                          {
                            projectId,
                            prompt: `Accepted. below is the result and the status of the proposal acceptance: ${JSON.stringify(data, null, 2)}`,
                            threadId: messageContext.message.thread_id,
                            context_config:
                              thread?.thread?.context_config || undefined,
                            images: [],
                            search_enabled: false,
                          },
                          {
                            onSuccess() {
                              refetch();
                            },
                          }
                        );
                      },
                      onError(error) {
                        console.error('Error accepting proposal', error);
                      },
                    }
                  );
                }}
              />
              <ProposalButton
                label='Accept'
                icon={MdOutlineDownloading}
                className='bg-emerald-800 text-emerald-50'
                isLoading={isApplyingProposal}
                onClick={() => {
                  applyProposal(
                    {
                      id: projectId,
                      selections: structuredOutputContext.selection,
                      proposal: {
                        messageId: messageContext.message.id,
                        ...structuredOutputContext.data,
                      },
                    },
                    {
                      onSuccess(data) {
                        console.log('Proposal accepted successfully', data);
                      },
                      onError(error) {
                        console.error('Error accepting proposal', error);
                      },
                    }
                  );
                }}
              />
            </>
          )}
          {hasIssues && (
            <>
              <ProposalButton
                label='Accept with errors'
                icon={MdOutlineDownloading}
                className='bg-yellow-700 text-amber-50'
                isLoading={isApplyingProposal}
                onClick={() => {
                  applyProposal(
                    {
                      id: projectId,
                      selections: structuredOutputContext.selection,
                      proposal: {
                        messageId: messageContext.message.id,
                        ...structuredOutputContext.data,
                      },
                    },
                    {
                      onSuccess(data) {
                        console.log('Proposal accepted successfully', data);
                      },
                      onError(error) {
                        console.error('Error accepting proposal', error);
                      },
                    }
                  );
                }}
              />
              <ProposalButton
                className='bg-background-1 text-foreground-2'
                icon={MdRefresh}
                label='Fix errors'
                isLoading={isContinuingThread}
                onClick={() => {
                  continueThread(
                    {
                      projectId,
                      prompt: `fix the errors in the proposal ${JSON.stringify(metadata?.diagnostics, null, 2)}`,
                      threadId: messageContext.message.thread_id,
                      context_config:
                        thread?.thread?.context_config || undefined,
                      images: [],
                      search_enabled: false,
                    },
                    {
                      onSuccess() {
                        refetch();
                      },
                    }
                  );
                }}
              />
            </>
          )}
        </>
      )}
    </div>
  );
}
