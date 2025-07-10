import { useAPIQuery } from '@/server/api/client';

export const DEFAULT_DIR = 'projects';
export const MOCK_NESTED = 'projects/web-monorepo/apps';

export const DEFAULT_SOURCES = [DEFAULT_DIR, MOCK_NESTED].map(btoa).join(',');

export function useInvalidateProjects() {
  return useAPIQuery('GET /projects/list', {
    sources: DEFAULT_SOURCES,
  }).refetch;
}

export function useProjects() {
  return useAPIQuery('GET /projects/list', {
    sources: DEFAULT_SOURCES,
  });
}
