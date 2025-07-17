import { ThreadDetailsMessageListItemFile } from '@/lib/react/structured-output/virtual-file';
import { useAssistantMessageContext } from '@/lib/react/structured-output/assistant-message-context';
import {
  useStructuredOutputContext,
  SelectionItem,
} from '@/lib/react/structured-output/structured-output-context';
import { key } from './shared';
import type { EditInstructions } from '.';

export * from './shared';

Component.getDefaultState = (
  data: EditInstructions
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
  const editSelection: SelectionItem[] = selection[key] || [];
  const { message } = useAssistantMessageContext();
  const files = message.metadata?.resolved?.[key] || [];
  const git = message.metadata?.diffs?.[key] || [];

  return (
    <>
      {files.map((file, i) => {
        const sel = editSelection.find(
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
                const prevEdit: SelectionItem[] = prev.edit_instructions || [];
                const idx = prevEdit.findIndex(
                  (p: SelectionItem) => p.path === file.path
                );
                let updatedEdit: SelectionItem[];
                if (idx >= 0) {
                  updatedEdit = prevEdit.map((p: SelectionItem, j: number) =>
                    j === idx ? { ...p, selected: newState } : p
                  );
                } else {
                  updatedEdit = [
                    ...prevEdit,
                    { path: file.path, selected: newState },
                  ];
                }
                return { ...prev, edit_instructions: updatedEdit };
              });
            }}
            icon={
              <span className='w-4 h-4 border-2 border-blue-600 flex relative'>
                <span className='absolute inset-0 flex items-center justify-center'>
                  <span className='w-2 h-2 bg-blue-300 rounded-full' />
                </span>
              </span>
            }
          />
        );
      })}
    </>
  );
}
