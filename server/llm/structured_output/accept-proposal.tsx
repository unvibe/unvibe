import {
  MdOutlineDownloading,
  MdOutlinePlayArrow,
  MdRefresh,
} from 'react-icons/md';
import { useAssistantMessageContext } from '@/lib/react/structured-output/assistant-message-context';
import { useStructuredOutputContext } from '@/lib/react/structured-output/structured-output-context';
import { useAPIMutation, useAPIQuery } from '@/server/api/client';
import { useParams } from 'react-router';
import { ProposalButton } from '@/lib/ui/button/proposal-button';

const normalizePath = (p: string) => (p.startsWith('./') ? p : `./${p}`);

export function AcceptProposal() {
  const messageContext = useAssistantMessageContext();
  const structuredOutputContext = useStructuredOutputContext();
  const { mutate: applyProposal, isPending: isApplyingProposal } =
    useAPIMutation('POST /projects/accept-proposal');
  const { mutate: continueThread, isPending: isContinuingThread } =
    useAPIMutation('POST /threads/continue');
  const projectId = useParams().project_id as string;
  const { data: thread, refetch } = useAPIQuery('GET /threads/details', {
    id: messageContext.message.thread_id,
  });

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

  const show =
    Object.values(messageContext.message.metadata?.resolved || {}).flat()
      .length > 0;

  if (!show) return null;

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
              disabled={Object.values(selection).every((sel) =>
                sel.every((s) => !s.selected)
              )}
              onClick={() => {
                applyProposal(
                  {
                    id: projectId,
                    selections: structuredOutputContext.selection,
                    messageId: messageContext.message.id,
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
              className='bg-emerald-600 text-emerald-950'
              isLoading={isApplyingProposal}
              disabled={Object.values(selection).every((sel) =>
                sel.every((s) => !s.selected)
              )}
              onClick={() => {
                applyProposal(
                  {
                    id: projectId,
                    selections: structuredOutputContext.selection,
                    messageId: messageContext.message.id,
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
            <ProposalButton
              label='Accept'
              icon={MdOutlineDownloading}
              className='bg-yellow-500 text-amber-950'
              isLoading={isApplyingProposal}
              onClick={() => {
                applyProposal(
                  {
                    id: projectId,
                    selections: structuredOutputContext.selection,
                    messageId: messageContext.message.id,
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
      </div>
    </div>
  );
}
