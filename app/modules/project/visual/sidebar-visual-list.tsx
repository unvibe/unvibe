import { useProject } from '../provider';
import { HiPlus } from 'react-icons/hi2';
import { FaRegEye } from 'react-icons/fa';
import { useParams } from '@/lib/next/navigation';
import Link from '@/lib/next/link';

export function SidebarVisualList() {
  const project = useProject();
  const uiEntries = project.UIEntryPoints;
  const projectId = useParams().project_id as string;

  return (
    <div className='grid content-start overflow-y-auto h-full w-full overflow-x-hidden'>
      <div className='flex justify-between items-center sticky top-0 bg-background-1 p-2 z-10 max-w-full'>
        <h3 className='flex gap-2 items-center py-1'>
          <FaRegEye className='w-6 h-6 text-foreground-2' />
          <span>Visual Mode</span>
        </h3>
        <button
          className='bg-background-1 p-1 rounded-md cursor-pointer'
          onClick={() => {
            console.log('Add new file action');
          }}
        >
          <HiPlus className='w-6 h-6' />
        </button>
      </div>
      <div className='grid content-start gap-1 p-2 pt-0 max-w-full overflow-x-auto'>
        {Object.entries(uiEntries).map(([plugin, entries]) => (
          <div key={plugin}>
            <div className='text-foreground-2 font-semibold'>{plugin}</div>
            <ul className='grid gap-1'>
              {entries
                // avoid recursive visual path
                .filter((entry) => !entry.path.includes('/visual'))
                .map((entry) => {
                  const path = entry.path.startsWith('/')
                    ? entry.path
                    : '/' + entry.path;
                  const href = `/projects/${projectId}/visual?path=${encodeURIComponent(
                    path
                  )}`;
                  return (
                    <li key={entry.path} className='text-foreground-2 text-xs'>
                      <Link
                        href={href}
                        className='block bg-background-2 p-1 rounded hover:bg-background-3 transition-colors'
                      >
                        {path}
                      </Link>
                    </li>
                  );
                })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
