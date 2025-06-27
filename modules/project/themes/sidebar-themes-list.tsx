import { HiPlus } from 'react-icons/hi2';
import { TiBrush } from 'react-icons/ti';

export function SidebarThemesList() {
  return (
    <div className='grid content-start overflow-y-auto h-full w-full'>
      <div className='flex justify-between items-center sticky top-0 bg-background-1 p-2 z-10'>
        <h3 className='font-mono flex gap-2 items-center py-1'>
          <TiBrush className='w-6 h-6 text-foreground-2' />
          <span>Themes</span>
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
      <div className='grid content-start gap-1 p-2 pt-0'>
        <div>
          <div className='font-mono p-2'>Default Theme</div>
        </div>
      </div>
    </div>
  );
}
