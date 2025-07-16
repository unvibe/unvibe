import { ThreadDetailsMessageListItemFile } from '../_shared/virtual-file';
import { useAssistantMessageContext } from '../_shared/assistant-message-context';
import {
  useStructuredOutputContext,
  SelectionItem,
} from '../_shared/structured-output-context';

export function StructuredOutputFindAndReplace() {
  const { selection, setSelection } = useStructuredOutputContext();
  const findSelection: SelectionItem[] = selection.find_and_replace || [];
  const { message } = useAssistantMessageContext();
  const files = message.metadata?.resolved?.find_and_replace || [];

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
                  <span className='w-2 h-2 bg-orange-300 rounded-full' />
                </span>
              </span>
            }
          />
        );
      })}
    </>
  );
}
