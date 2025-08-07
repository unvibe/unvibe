import { ClientEndpointsMap, useAPIQuery as useV2Q } from '@/server/api/client';

import { useAPIMutation } from '@/server/api/client';
import { useParams } from '@/lib/next/navigation';
import { StartThreadInput } from '~/modules/project/threads/llm-input';
import { useQueryClient } from '@tanstack/react-query';

export function ContinueThreadInput() {
  const params = useParams();
  const projectId =
    typeof params.project_id === 'string' ? params.project_id : '';
  const threadId = typeof params.id === 'string' ? params.id : '';
  const queryClient = useQueryClient();
  const { data } = useV2Q('GET /threads/details', {
    id: threadId ?? '',
  });

  const { mutate: continueThread, isPending } = useAPIMutation(
    'POST /threads/continue',
    {
      onMutate: async (variables) => {
        // optimistically update the thread details
        const queryKey = ['GET /threads/details', { id: variables.threadId }];
        await queryClient.cancelQueries({ queryKey });

        const previousThreadDetails = queryClient.getQueryData(queryKey);

        queryClient.setQueryData(
          queryKey,
          (
            old: NonNullable<
              ClientEndpointsMap['GET /threads/details']['output']
            >
          ) => {
            return {
              ...old,
              thread: {
                ...old?.thread,
                messages: [
                  ...(old?.thread?.messages || []),
                  {
                    id: variables.prompt, // assuming prompt is the message ID
                    thread_id: variables.threadId,
                    index: (old?.thread?.messages?.length || 0) + 1,
                    refusal: null,
                    content: variables.prompt,
                    images_urls: variables.images,
                    search_enabled: variables.search_enabled,
                    created_at: Date.now(),
                    updated_at: Date.now(),
                    role: 'user',
                  },
                ],
              },
            } as typeof old;
          }
        );

        return { previousThreadDetails };
      },
      onError: (error, variables, context) => {
        // Rollback to previous thread details on error
        if (context?.previousThreadDetails) {
          queryClient.setQueryData(
            ['GET /threads/details', { id: variables.threadId }],
            context.previousThreadDetails
          );
        }
      },
      onSettled: () => {
        // Always refetch after error or success
        queryClient.invalidateQueries({
          queryKey: ['GET /threads/details', { id: threadId }],
        });
      },
    }
  );
  const { refetch } = useV2Q(
    'GET /threads/details',
    { id: threadId ?? '' },
    !!threadId
  );

  if (!threadId) return null;

  return (
    <StartThreadInput
      isPending={isPending}
      placeholder='Continue the conversation...'
      initialContextConfig={data?.thread?.context_config || undefined}
      currentModelId={data?.thread?.model_id}
      threadId={threadId}
      onSubmit={({
        prompt,
        images,
        search_enabled,
        clearAttachments,
        setPrompt,
        contextConfig,
      }) => {
        continueThread(
          {
            threadId,
            prompt,
            projectId,
            search_enabled,
            images,
            context_config: contextConfig,
          },
          {
            onSuccess() {
              clearAttachments();
              setPrompt('');
              refetch();
            },
          }
        );
      }}
    />
  );
}
