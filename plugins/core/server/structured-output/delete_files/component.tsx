import { ThreadDetailsMessageListItemFile } from '@/lib/react/structured-output/virtual-file';
import { useAssistantMessageContext } from '@/lib/react/structured-output/assistant-message-context';
import {
  SelectionItem,
  useStructuredOutputContext,
} from '@/lib/react/structured-output/structured-output-context';
import { key } from './shared';
import type { DeleteFiles } from '.';

export * from './shared';

Component.getDefaultState = (
  data: DeleteFiles
): Record<string, SelectionItem[]> => {
  return {
    [key]: data?.map((item) => ({
      path: item.path,
      selected: true,
    })),
  };
};

export function Component() {
  const { selection, setSelection } = useStructuredOutputContext();
  const { message } = useAssistantMessageContext();
  const files = message.metadata?.resolved?.[key] || [];
  const deleteSelection = selection?.[key] || [];

  return (
    <>
      {files.map((file, i) => {
        const sel = deleteSelection.find((p) => p.path === file.path);
        const git = message.metadata?.diffs?.delete_files?.find(
          (d) => d.path === file.path
        )?.data;
        return (
          <ThreadDetailsMessageListItemFile
            NO_CONTENT
            git={git}
            icon={
              <span className='w-4 h-4 border-2 border-rose-600 flex relative'>
                <span className='absolute inset-0 flex items-center justify-center'>
                  <span className='w-0.5 h-2 bg-rose-600 rotate-90' />
                </span>
                <span className='absolute inset-0 flex items-center justify-center'>
                  <span className='w-0.5 h-2 bg-rose-600' />
                </span>
              </span>
            }
            key={file.path + i.toString()}
            data={file}
            type='remove'
            selected={!!sel?.selected}
            setSelected={(newState) => {
              setSelection((prev) => {
                const prevDelete = prev.delete_files || [];
                const idx = prevDelete.findIndex((p) => p.path === file.path);
                let updatedDelete: typeof prevDelete;
                if (idx >= 0) {
                  updatedDelete = prevDelete.map((p, j) =>
                    j === idx ? { ...p, selected: newState } : p
                  );
                } else {
                  updatedDelete = [
                    ...prevDelete,
                    { path: file.path, selected: newState },
                  ];
                }
                return { ...prev, delete_files: updatedDelete };
              });
            }}
          />
        );
      })}
    </>
  );
}
