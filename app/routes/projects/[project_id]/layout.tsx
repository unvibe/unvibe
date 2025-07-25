import { ProjectLayoutSidebar } from '~/modules/project/layout';
import { ProjectProvider } from '~/modules/project/provider';
import { Route } from './+types/layout';
import { Outlet } from 'react-router';
import { client } from '@/server/api/client';

export async function loader({ params }: Route.LoaderArgs) {
  try {
    const data = await client('GET /projects/parse-project', {
      id: params.project_id,
    });
    return {
      project: data.project,
    };
  } catch (error) {
    console.error('Error loading project:', error);
    throw new Response('Failed to load project', { status: 500 });
  }
}

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const data = await client('GET /projects/parse-project', {
    id: params.project_id,
  });
  return {
    project: data.project,
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
