import { highlightCode } from '@/modules/markdown/library/parser';
import clsx from 'clsx';
import { useEffect, useState } from 'react';

export function MinimalFileContent({
  content,
  path,
}: {
  content: string;
  path: string;
}) {
  const [highlighted, setHighlighted] = useState(content || '');

  useEffect(() => {
    const ext = path.split('.').pop() || 'text';
    highlightCode(content || '', ext).then((result) => {
      setHighlighted(result);
    });
  }, [content, path]);

  return (
    <div className='rounded-xl max-w-full overflow-hidden relative border border-border'>
      <pre
        dangerouslySetInnerHTML={{ __html: highlighted }}
        className={clsx(
          'relative text-foreground-1 whitespace-pre-wrap text-xs font-mono max-h-[300px] overflow-hidden',
          '[&>*]:px-4 [&>*]:pt-3 [&>*]:pb-4 [&>*]:overflow-x-auto'
        )}
      />
    </div>
  );
}
export function ThreadDetailsMessageListItemFileContent({
  data,
  initCodeSnippet,
  expanded,
  setExpanded,
  codeSnippetRef,
  selected,
}: {
  expanded: boolean;
  setExpanded: (newState: boolean) => void;
  data: { path: string; content?: string };
  initCodeSnippet: (node: HTMLPreElement | null) => void;
  codeSnippetRef: React.RefObject<HTMLPreElement | null>;
  selected?: boolean;
  setSelected?: (selected: boolean) => void;
}) {
  const [highlighted, setHighlighted] = useState(data.content || '');
  const { content, path } = data;

  useEffect(() => {
    const ext = path.split('.').pop() || 'text';
    highlightCode(content || '', ext).then((result) => {
      setHighlighted(result);
    });
  }, [content, path]);

  return (
    <div className='rounded-xl max-w-full overflow-hidden relative'>
      <pre
        ref={initCodeSnippet}
        dangerouslySetInnerHTML={{ __html: highlighted }}
        className={clsx(
          'relative text-foreground-1 whitespace-pre-wrap text-xs font-mono max-h-[300px] overflow-hidden',
          '[&>*]:px-4 [&>*]:pt-3 [&>*]:pb-4 [&>*]:overflow-x-auto',
          !selected && 'opacity-20'
        )}
      />
      {!expanded && (
        <div className='absolute bottom-1 w-full flex justify-center font-mono text-xs'>
          <div className='absolute -bottom-1 h-[50px] inset-x-0 bg-gradient-to-t from-background-2 via-background-2/50 to-transparent'></div>
          <button
            className='text-foreground-2 border bg-background-2 border-border z-10 px-4 py-2 rounded-full shadow dark:shadow-black/20 cursor-pointer'
            onClick={() => {
              setExpanded(true);
              if (codeSnippetRef.current) {
                codeSnippetRef.current.classList.remove('max-h-[300px]');
              }
            }}
          >
            ... show more
          </button>
        </div>
      )}
    </div>
  );
}
