import { copyToClipboard } from '@/lib/browser/copy-to-clipboard';
import { FileActionProps } from '@/plugins/_types/plugin-client';
import { HiOutlineSquare2Stack } from 'react-icons/hi2';
import { MdCompress, MdExpand } from 'react-icons/md';

export function CopyAction({ data }: FileActionProps) {
  return (
    <button
      className='bg-background-1/50 rounded-xl p-2 cursor-pointer'
      onClick={() => {
        if (!data.content) return;
        copyToClipboard(data.content);
      }}
    >
      <HiOutlineSquare2Stack className='w-5 h-5' />
    </button>
  );
}

export function ToggleFileExpandedAction({
  expanded,
  setExpanded,
  codeSnippetRef,
}: FileActionProps) {
  return (
    <button
      className='bg-background-1/50 rounded-xl p-2 cursor-pointer'
      onClick={() => {
        if (expanded) {
          setExpanded(false);
          if (codeSnippetRef.current) {
            codeSnippetRef.current.classList.add('max-h-[300px]');
          }
        } else {
          setExpanded(true);
          if (codeSnippetRef.current) {
            codeSnippetRef.current.classList.remove('max-h-[300px]');
          }
        }
      }}
    >
      {expanded ? (
        <MdCompress className='w-5 h-5' />
      ) : (
        <MdExpand className='w-5 h-5' />
      )}
    </button>
  );
}
