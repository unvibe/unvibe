import { QueryClient } from '@tanstack/react-query';
import { Endpoints as Client, createClient } from './create.server';
import { baseURL } from '../constants';

export const client = createClient(baseURL);

export type { Endpoints as ClientEndpointsMap } from './create.server';

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
