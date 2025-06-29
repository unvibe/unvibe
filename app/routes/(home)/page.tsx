// import { WelcomeMessage } from '@/modules/home';
// import { createClient } from '@/server/api/client/create';
// import { baseURL } from '@/server/api/constants';
// import { Route } from './+types/page';
import { redirect } from 'react-router';

export async function loader() {
  return redirect('/home/projects');
  // const client = createClient(baseURL);
  // const data = await client('GET /projects/list', { sources: 'projects' });

  // return {
  //   projects: data.projects,
  // };
}

export async function clientLoader() {
  return redirect('/home/projects');
}

export default function HomePage() {
  return null;
  // const recent = loaderData.projects.projects.slice(0, 3);
  // return (
  //   <div className='max-w-7xl mx-auto py-8 grid gap-4 content-start pr-8'>
  //     <WelcomeMessage recent={recent} />
  //   </div>
  // );
}
