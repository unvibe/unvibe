import { HomeSidebar } from '~/modules/home/home-sidebar';
import { Outlet } from 'react-router';

export default function Layout() {
  return (
    <div className='flex w-full h-screen'>
      <aside className='w-[360px] h-screen overflow-hidden grid shrink-0'>
        <HomeSidebar />
      </aside>
      <main className='w-full max-w-full overflow-x-hidden'>
        <Outlet />
      </main>
    </div>
  );
}
