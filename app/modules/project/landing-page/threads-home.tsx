import { StartThreadInput } from '~/modules/project/threads/llm-input';
import {
  ClientEndpointsMap,
  getQueryKey,
  useAPIMutation,
} from '@/server/api/client';
import { useParams, useRouter } from '@/lib/next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import type { Thread } from '@/server/db/schema';

export function ThreadsHome() {
  const params = useParams();
  const projectId =
    typeof params.project_id === 'string' ? params.project_id : '';

  const queryClient = useQueryClient();

  const { mutate: createThread, isPending: isCreatingThread } = useAPIMutation(
    'POST /threads/create',
    {
      onError: (_, __, context) => {
        const queryKey = getQueryKey('GET /threads/list', {
          projectId,
          type: 'thread',
        });
        queryClient.setQueryData(queryKey, context.previousThreads);
      },
      // Always refetch after error or success:
      onSettled: () => {
        const queryKey = getQueryKey('GET /threads/list', {
          projectId,
          type: 'thread',
        });
        queryClient.invalidateQueries({ queryKey });
      },
      onMutate: async (variables) => {
        // optimistically update the thread list
        const queryKey = getQueryKey('GET /threads/list', {
          projectId,
          type: 'thread',
        });
        await queryClient.cancelQueries({ queryKey: queryKey });

        const previousThreads =
          queryClient.getQueryData<
            ClientEndpointsMap['GET /threads/list']['output']
          >(queryKey);

        queryClient.setQueryData<
          ClientEndpointsMap['GET /threads/list']['output']
        >(queryKey, (old) => {
          return {
            threads: [
              ...(old?.threads || []),
              {
                id: variables.id,
                type: 'thread',
                project_id: projectId,
                pinned: false,
                archived: false,
                context_config: variables.context_config,
                model_id: variables.model_id,
                created_at: Date.now(),
                title: 'untitled',
                updated_at: Date.now(),
                workspaces: [],
              } as Thread,
            ],
          };
        });

        return { previousThreads };
      },
    }
  );

  const { mutate, isPending } = useAPIMutation('POST /threads/continue', {
    onError: (_, __, context) => {
      const queryKey = getQueryKey('GET /threads/details', {
        id: __.threadId,
      });
      queryClient.setQueryData<
        ClientEndpointsMap['GET /threads/details']['output']
      >(queryKey, context?.previousThread);
    },
    onSettled: (_, __, variables) => {
      const queryKey = getQueryKey('GET /threads/details', {
        id: variables.threadId,
      });
      queryClient.invalidateQueries({ queryKey });
    },
    // optimistically update the thread details
    onMutate: async (variables) => {
      // optimistically update the thread list
      const queryKey = getQueryKey('GET /threads/details', {
        id: variables.threadId,
      });
      await queryClient.cancelQueries({ queryKey });

      const previousThread =
        queryClient.getQueryData<
          ClientEndpointsMap['GET /threads/details']['output']
        >(queryKey);

      queryClient.setQueryData<
        ClientEndpointsMap['GET /threads/details']['output']
      >(queryKey, (old) => {
        return {
          ...old,
          error: null,
          status: true,
          thread: {
            ...old?.thread,
            messages: [
              ...(old?.thread?.messages || []),
              {
                id: crypto.randomUUID(),
                role: 'user',
                content: variables.prompt,
                attachments: variables.images || [],
                created_at: Date.now(),
              },
            ],
          },
        } as ClientEndpointsMap['GET /threads/details']['output'];
      });
      return { previousThread };
    },
  });

  const router = useRouter();
  return (
    <div className='max-w-8xl relative'>
      <h1 className='text-3xl pb-8 font-bold font-mono'>
        Beep Boop! Let&apos;s Build Something Together
      </h1>
      <StartThreadInput
        isPending={isPending || isCreatingThread}
        onSubmit={({
          prompt,
          images,
          search_enabled,
          contextConfig,
          clearAttachments,
          setPrompt,
          model_id,
        }) => {
          const id = crypto.randomUUID();
          createThread(
            {
              id,
              context_config: contextConfig,
              model_id,
              projectId,
              prompt,
            },
            {
              onSuccess({ id }) {
                router.push(`/projects/${projectId}/threads/${id}`);
                mutate(
                  {
                    projectId,
                    threadId: id,
                    prompt,
                    images,
                    search_enabled,
                    context_config: contextConfig,
                  },
                  {
                    onSuccess() {
                      clearAttachments();
                      setPrompt('');
                    },
                  }
                );
              },
            }
          );
        }}
      />
    </div>
  );
}
