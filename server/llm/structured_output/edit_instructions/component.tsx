import { ThreadDetailsMessageListItemFile } from '../_shared/virtual-file';
import { useAssistantMessageContext } from '../_shared/assistant-message-context';
import {
  useStructuredOutputContext,
  SelectionItem,
} from '../_shared/structured-output-context';

export function StructuredOutputEditInstructions() {
  const { selection, setSelection } = useStructuredOutputContext();
  const editSelection: SelectionItem[] = selection.edit_instructions || [];
  const { message } = useAssistantMessageContext();
  const files = message.metadata?.resolved?.edit_instructions || [];
  const git = message.metadata?.diffs?.edit_instructions || [];

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
