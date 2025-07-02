import { ThreadDetails } from '@/modules/project/threads/details';
import { ThreadDetailsHeaderActions } from '@/modules/project/threads/details/header';
import { Route } from './+types/page';

export default function Page({ params }: Route.ComponentProps) {
  const id = params.id;
  return (
    <div className='w-full h-full max-h-screen overflow-hidden max-w-full relative'>
      <div className='max-w-5xl mx-auto w-full h-full overflow-hidden'>
        <ThreadDetails id={id} />
      </div>
      <div className='absolute inset-y-0 right-0 p-8 z-50'>
        <ThreadDetailsHeaderActions id={id} />
      </div>
    </div>
  );
}
