import { useMemo } from 'react';
import { useStructuredOutputContext } from './context';
import {
  CustomRenderTree,
  CustomRenderTreeDirProps,
  CustomRenderTreeFileProps,
  makeTree,
} from '~/modules/project/files/render-tree';
import { TiDocument, TiFolderOpen } from 'react-icons/ti';

export function Dir({ name, children }: CustomRenderTreeDirProps) {
  return (
    <div
      style={{ marginLeft: 8 }}
      className='shrink-0 whitespace-nowrap border-l border-border max-w-full'
    >
      <strong className='flex items-center gap-2'>
        <TiFolderOpen className='w-5 h-5 shrink-0' />
        {name}
      </strong>
      <div>{children}</div>
    </div>
  );
}

export function DirFile({ name }: CustomRenderTreeFileProps) {
  return (
    <div
      style={{ marginLeft: 8 }}
      className='flex items-center gap-2 shrink-0 whitespace-nowrap max-w-full'
    >
      <TiDocument className='w-5 h-5 text-foreground-2 shrink-0' />
      {name}
    </div>
  );
}

export function FilesTree() {
  const { data } = useStructuredOutputContext();

  const tree = useMemo(() => {
    const replace = data.replace_files || [];
    const remove = data.delete_files || [];
    const all = [...replace, ...remove];
    const paths = all.map((file) => file.path);
    const parsed = makeTree(paths);
    return parsed.children['.'];
  }, []);

  return (
    <div className='flex items-stretch'>
      <CustomRenderTree
        level={1}
        tree={tree}
        Dir={Dir}
        DirFile={DirFile}
        className='font-mono text-sm border-r border-border overflow-x-auto max-w-1/3 shrink-0'
      />
    </div>
  );
}
