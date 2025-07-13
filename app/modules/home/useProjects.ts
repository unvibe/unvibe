import { useAPIQuery } from '@/server/api/client';

export const DEFAULT_DIR = 'projects';

export function useInvalidateProjects() {
  const sourcesQuery = useAPIQuery('GET /home/list-sources', {});
  const sources = sourcesQuery.data?.sources || [];
  return useAPIQuery(
    'GET /projects/list',
    {
      sources: sources?.map(btoa).join(','),
    },
    sourcesQuery.isFetching ? false : true
  ).refetch;
}

export function useProjects() {
  const sourcesQuery = useAPIQuery('GET /home/list-sources', {});
  const sources = sourcesQuery.data?.sources || [];

  return useAPIQuery(
    'GET /projects/list',
    {
      sources: sources?.map(btoa).join(','),
    },
    sourcesQuery.isFetching ? false : true
  );
}
