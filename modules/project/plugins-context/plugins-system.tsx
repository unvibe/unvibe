import { useCallback } from 'react';
import { MonacoEditor } from '@/modules/ui/monaco-editor';
import { parseContext } from './utils';

export function ContextItemDetailsSystem({
  data,
}: {
  data: ReturnType<typeof parseContext>[number];
}) {
  const setupHeight = useCallback((node: HTMLDivElement | null) => {
    if (!node) return;
    (node.childNodes[0] as HTMLElement).style.height = `${node.clientHeight}px`;
  }, []);

  return (
    <div
      className='w-full h-full overflow-hidden bg-blue-200'
      ref={setupHeight}
    >
      <MonacoEditor fileName={data.key} content={data.description} />;
    </div>
  );
}
