import { useCallback } from 'react';
import { MonacoEditor } from '@/modules/ui/monaco-editor';
import { parseContext } from './utils';
import { useAPIMutation } from '@/server/api/client';
import { useParams } from 'react-router';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { HiTrash } from 'react-icons/hi';

export function ContextItemDetailsSystem({
  data,
  onRemove,
  queryKeyToRefetch,
}: {
  data: ReturnType<typeof parseContext>[number];
  onRemove?: () => void;
  queryKeyToRefetch?: unknown[];
}) {
  const setupHeight = useCallback((node: HTMLDivElement | null) => {
    if (!node) return;
    (node.childNodes[0] as HTMLElement).style.height = `${node.clientHeight}px`;
  }, []);
  const [removing, setRemoving] = useState(false);
  const projectId = useParams().project_id as string;
  const queryClient = useQueryClient();
  const removeSystem = useAPIMutation('POST /custom-plugin/remove-system', {
    onSuccess: () => {
      setRemoving(false);
      if (onRemove) onRemove();
      if (queryKeyToRefetch)
        queryClient.invalidateQueries({ queryKey: queryKeyToRefetch });
    },
    onError: () => {
      setRemoving(false);
    },
  });

  return (
    <div
      className='w-full h-full overflow-hidden bg-blue-200 relative'
      ref={setupHeight}
    >
      <MonacoEditor fileName={data.key} content={data.description} />
      {data.source_id === 'custom' && (
        <button
          className='absolute top-2 right-2 p-2 rounded-full bg-red-100 hover:bg-red-300 text-red-700 transition-all shadow'
          title='Remove this system part'
          disabled={removing}
          onClick={() => {
            setRemoving(true);
            removeSystem.mutate({ projectId, key: data.key });
          }}
        >
          <HiTrash />
        </button>
      )}
    </div>
  );
}
