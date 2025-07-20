import { ThreadDetailsMessageListItemFile } from '@/lib/react/structured-output/virtual-file';
import { useAssistantMessageContext } from '@/lib/react/structured-output/assistant-message-context';
import {
  useStructuredOutputContext,
  SelectionItem,
} from '@/lib/react/structured-output/structured-output-context';
import { key } from './shared';
import type { FindAndReplace } from '.';

export * from './shared';

Component.getDefaultState = (
  data: FindAndReplace[]
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
  const findSelection: SelectionItem[] = selection?.[key] || [];
  const { message } = useAssistantMessageContext();
  const files = message.metadata?.resolved?.[key] || [];
  const git = message.metadata?.diffs?.[key] || [];

  return (
    <>
      {files.map((file, i) => {
        const sel = findSelection.find(
          (p: SelectionItem) => p.path === file.path
        );
        return (
          <ThreadDetailsMessageListItemFile
            key={file.path + i.toString()}
            enabledEditing={true}
            data={file}
            git={git.find((d) => d.path === file.path)?.data}
            selected={!!sel?.selected}
            setSelected={(newState) => {
              setSelection((prev) => {
                const prevFind: SelectionItem[] = prev.find_and_replace || [];
                const idx = prevFind.findIndex(
                  (p: SelectionItem) => p.path === file.path
                );
                let updatedFind: SelectionItem[];
                if (idx >= 0) {
                  updatedFind = prevFind.map((p: SelectionItem, j: number) =>
                    j === idx ? { ...p, selected: newState } : p
                  );
                } else {
                  updatedFind = [
                    ...prevFind,
                    { path: file.path, selected: newState },
                  ];
                }
                return { ...prev, find_and_replace: updatedFind };
              });
            }}
            icon={
              <span className='w-4 h-4 border-2 border-orange-600 flex relative'>
                <span className='absolute inset-0 flex items-center justify-center'>
                  <span className='w-0.5 h-2 bg-orange-600 rotate-90' />
                </span>
                <span className='absolute inset-0 flex items-center justify-center'>
                  <span className='w-0.5 h-2 bg-orange-600' />
                </span>
              </span>
            }
          />
        );
      })}
    </>
  );
}
