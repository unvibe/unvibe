import { noop } from '@/lib/core/noop';
import { ProjectLayoutSidebar } from '@/modules/project/layout';
import { ProjectProvider } from '@/modules/project/provider';
import type { Project } from '@/plugins/core/server/api/lib/project';
import { Route } from './+types/layout';
import { Outlet } from 'react-router';

async function getProject(project_id: string): Promise<Project> {
  try {
    const projectResponse = await fetch(
      'http://localhost:3008/api/v2/projects/parse-project?source=projects&projectDirname=' +
        project_id
    );
    const json = await projectResponse.json();
    return json.project;
  } catch (error) {
    noop(error);
    throw new Error('Failed to fetch project');
  }
}

export async function loader({ params }: Route.LoaderArgs) {
  return {
    project: await getProject(params.project_id),
  };
}

export default function Layout({ loaderData }: Route.ComponentProps) {
  const project = loaderData.project;
  return (
    <ProjectProvider project={project}>
      <div className='flex w-full h-screen'>
        <aside className='w-[360px] h-screen overflow-hidden grid shrink-0'>
          <ProjectLayoutSidebar />
        </aside>
        <main className='w-full max-w-full overflow-x-hidden'>
          <Outlet />
        </main>
      </div>
    </ProjectProvider>
  );
}
