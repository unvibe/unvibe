import { useAPIQuery } from '@/server/api/client';

export const DEFAULT_DIR = 'projects';

export function useProjects() {
  const { data } = useAPIQuery('GET /projects/list', {
    sources: [DEFAULT_DIR].join(','),
  });
  const projects = data?.projects?.[DEFAULT_DIR];

  return projects;
}
