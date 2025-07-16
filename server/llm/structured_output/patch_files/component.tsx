import { ThreadDetailsMessageListItemFile } from '../_shared/virtual-file';
import { useAssistantMessageContext } from '../_shared/assistant-message-context';
import {
  useStructuredOutputContext,
  SelectionItem,
} from '../_shared/structured-output-context';

export function StructuredOutputPatchFiles() {
  const { selection, setSelection } = useStructuredOutputContext();
  const patchSelection: SelectionItem[] = selection.patch_files || [];
  const { message } = useAssistantMessageContext();
  const files = message.metadata?.resolved?.patch_files || [];

  return (
    <>
      {files.map((file, i) => {
        const sel = patchSelection.find(
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
                const prevPatch: SelectionItem[] = prev.patch_files || [];
                const idx = prevPatch.findIndex(
                  (p: SelectionItem) => p.path === file.path
                );
                let updatedPatch: SelectionItem[];
                if (idx >= 0) {
                  updatedPatch = prevPatch.map((p: SelectionItem, j: number) =>
                    j === idx ? { ...p, selected: newState } : p
                  );
                } else {
                  updatedPatch = [
                    ...prevPatch,
                    { path: file.path, selected: newState },
                  ];
                }
                return { ...prev, patch_files: updatedPatch };
              });
            }}
            icon={
              <span className='w-4 h-4 border-2 border-purple-600 flex relative'>
                <span className='absolute inset-0 flex items-center justify-center'>
                  <span className='w-2 h-2 bg-purple-300 rounded-full' />
                </span>
              </span>
            }
          />
        );
      })}
    </>
  );
}
