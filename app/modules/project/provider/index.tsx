import type { Project } from '@/server/project/types';
import { createContext, useContext, useMemo } from 'react';
import * as ClientPluginsMap from '@/plugins/plugins-client';
import { useParams } from '@/lib/next/navigation';

export const ProjectContext = createContext<Project | null>(null);

export function useClientPlugins() {
  return Object.values(ClientPluginsMap).map((p) => p.Plugin);
}

export function useProjectActions() {
  const project = useProject();
  const params = useParams();
  const projectId = params.project_id as string;

  const diagnosticChecks = useMemo(() => {
    return Object.values(project.plugins)
      .map((plugin) => {
        return {
          plugin: plugin.id,
          checks: plugin.sourceCodeHooks.filter((d) => d.operations.diagnostic),
        };
      })
      .flat();
  }, [project]);

  const clientPlugins = useMemo(() => {
    return Object.values(ClientPluginsMap).filter((p) =>
      Object.values(project.plugins)
        .map((pp) => pp.id)
        .includes(p.Plugin.id)
    );
  }, [project]);

  return { diagnosticChecks, clientPlugins, projectDirname: projectId };
}

export function useProject() {
  const project = useContext(ProjectContext);

  if (!project) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return project;
}

export function ProjectProvider({
  project,
  children,
}: {
  project: Project;
  children: React.ReactNode;
}) {
  return (
    <ProjectContext.Provider value={project}>
      {children}
    </ProjectContext.Provider>
  );
}
