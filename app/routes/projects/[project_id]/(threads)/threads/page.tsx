import { ThreadsHome } from '~/modules/project/landing-page/threads-home';
import { client } from '@/server/api/client/index.server';

export async function loader() {
  return {
    models: await client('GET /models'),
  };
}

export default function Page() {
  return (
    <main className='w-full px-8 h-screen flex items-center justify-center text-center overflow-y-auto relative'>
      <ThreadsHome />
    </main>
  );
}
