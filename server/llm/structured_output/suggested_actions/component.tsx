import { MdChevronRight } from 'react-icons/md';
import { useStructuredOutputContext } from '../_shared/structured-output-context';
import { useAPIMutation, useAPIQuery } from '@/server/api/client';
import { useParams } from 'react-router';
import { useAssistantMessageContext } from '../_shared/assistant-message-context';
import { ProposalButton } from '@/lib/ui/button/proposal-button';

export function StructuredOutputSuggestedActions() {
  const { data } = useStructuredOutputContext();
  const messageContext = useAssistantMessageContext();
  const {
    mutate: continueThread,
    isPending: isContinuingThread,
    variables,
  } = useAPIMutation('POST /threads/continue');
  const suggestedPrompts = data.suggested_actions || [];
  const projectId = useParams().projectId as string;
  const { data: thread, refetch } = useAPIQuery('GET /threads/details', {
    id: messageContext.message.thread_id,
  });

  if (suggestedPrompts.length === 0) {
    return null;
  }

  return (
    <div className='flex items-center justify-between pt-4 pb-2 gap-4'>
      <div className='grid content-start justify-start gap-4'>
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
                    context_config: thread?.thread?.context_config || undefined,
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
