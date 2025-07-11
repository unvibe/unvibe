import {
  MdChevronRight,
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
  disabled = false,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  className?: string;
  onClick?: () => void;
  isLoading?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      className={`font-mono text-xs p-1 px-3 rounded-lg flex items-center gap-2 cursor-pointer disabled:opacity-50 ${className}`}
      onClick={onClick}
      disabled={isLoading || disabled}
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

const normalizePath = (p: string) => (p.startsWith('./') ? p : `./${p}`);

export function AcceptProposal() {
  // get if there are any errors in any of the selected files
  const messageContext = useAssistantMessageContext();
  const structuredOutputContext = useStructuredOutputContext();
  const suggestedPrompts = structuredOutputContext.data.suggested_actions || [];
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

  const selection = structuredOutputContext.selection;

  const hasIssues = Object.values(selection)
    .flat()
    .filter(
      (s): s is { selected: true; path: string } => s.selected && 'path' in s
    )
    .some((s) => {
      return Object.values(metadata?.diagnostics || {}).some((record) => {
        return Object.entries(record).some(([path, ds]) => {
          const normalizedPath = normalizePath(path);
          return normalizedPath === s.path && ds.some((m) => !!m.type);
        });
      });
    });

  const { mutate: applyProposal, isPending: isApplyingProposal } =
    useAPIMutation('POST /projects/accept-proposal');
  const {
    mutate: continueThread,
    isPending: isContinuingThread,
    variables,
  } = useAPIMutation('POST /threads/continue');
  const projectId = useParams().project_id as string;
  const { data: thread, refetch } = useAPIQuery('GET /threads/details', {
    id: messageContext.message.thread_id,
  });

  if (hasNoFilesAndNoScripts) {
    return (
      <div className='flex items-center justify-between pt-4 pb-2 gap-4'>
        <div className='flex items-stretch gap-4 flex-wrap'>
          {suggestedPrompts.length > 0 &&
            suggestedPrompts.map((prompt) => (
              <ProposalButton
                key={prompt}
                label={prompt}
                icon={MdChevronRight}
                className='bg-background-1 text-foreground-2'
                isLoading={isContinuingThread && variables?.prompt === prompt}
                onClick={() => {
                  continueThread(
                    {
                      projectId,
                      prompt,
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
                      onError(error) {
                        console.error('Error continuing thread', error);
                      },
                    }
                  );
                }}
              />
            ))}
        </div>
      </div>
    );
  }
  return (
    <div className='flex items-center justify-end pt-4 pb-2 gap-4'>
      <div className='flex items-center gap-4'>
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
              disabled={Object.values(selection).every((sel) =>
                sel.every((s) => !s.selected)
              )}
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
                    context_config: thread?.thread?.context_config || undefined,
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
      </div>
    </div>
  );
}
