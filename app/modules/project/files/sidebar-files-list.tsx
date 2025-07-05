import { TiFolder } from 'react-icons/ti';
import { useProject } from '../provider';
import { HiPlus } from 'react-icons/hi2';
import { makeTree, RenderTree } from './render-tree';

export function SidebarFilesList() {
  const project = useProject();
  const files = project?.paths || [];
  const projectName = project.path.split('/').pop();

  const tree = makeTree(files).children['.'];
  return (
    <div className='grid content-start overflow-y-auto h-full w-full overflow-x-hidden'>
      <div className='flex justify-between items-center sticky top-0 bg-background-1 p-2 z-10 max-w-full'>
        <h3 className='flex gap-2 items-center py-1'>
          <TiFolder className='w-6 h-6 text-foreground-2' />
          <span>Files</span>
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
        <RenderTree tree={tree} level={1} name={projectName} />
      </div>
    </div>
  );
}
