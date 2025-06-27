import type { Project } from '@/plugins/core/server/api/lib/project';
import { createContext, useContext, useMemo } from 'react';
import * as ClientPluginsMap from '@/plugins/plugins-client';
import { useParams } from '@/lib/next/navigation';

export const ProjectContext = createContext<Project | null>(null);

export function useProjectActions() {
  const project = useProject();
  const params = useParams();
  const projectDirname = params.project_id as string;

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

  return { diagnosticChecks, clientPlugins, projectDirname };
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
