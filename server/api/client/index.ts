import {
  QueryClient,
  useMutation,
  UseMutationOptions,
  useQuery,
  UseQueryResult,
} from '@tanstack/react-query';
import { Endpoints as Client, createClient } from './create';
import { baseURL } from '../constants';

export const client = createClient(baseURL);

export type { Endpoints as ClientEndpointsMap } from './create';

export type UseAPIQuery<T extends keyof Client> = (
  url: T,
  config: Client[T]['input'],
  enabled: boolean
) => UseQueryResult<Client[T]['output'], Error>;

export const getQueryKey = <T extends keyof Client>(
  url: T,
  config?: Client[T]['input']
) => {
  return [url, config];
};

export function prefetchAPIQuery<T extends keyof Client>(
  url: T,
  queryClient: QueryClient,
  config?: Client[T]['input']
) {
  return queryClient.prefetchQuery<Client[T]['output'], Error>({
    queryKey: getQueryKey(url, config),
    queryFn: async () => {
      return client(url, config);
    },
  });
}

export function useAPIQuery<T extends keyof Client>(
  url: T,
  config?: Client[T]['input'],
  enabled: boolean = true
) {
  return useQuery<Client[T]['output']>({
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    queryKey: [url, config],
    enabled: enabled,
    retry: false,
    queryFn: async () => {
      return client(url, config);
    },
  });
}

export function useAPIMutation<T extends keyof Client>(
  url: T,
  mutationConfig?: UseMutationOptions<
    Client[T]['output'],
    Error,
    Client[T]['input'],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    any
  >
) {
  return useMutation({
    mutationKey: [url],
    mutationFn: async (config: Client[T]['input']) => {
      return client(url, config);
    },
    retry: false,
    onError: (error) => {
      console.error('API error:', error);
    },
    ...mutationConfig,
  });
}
