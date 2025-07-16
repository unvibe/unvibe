import { ThreadDetailsMessageListItemFile } from '../_shared/virtual-file';
import { useAssistantMessageContext } from '../_shared/assistant-message-context';
import {
  useStructuredOutputContext,
  SelectionItem,
} from '../_shared/structured-output-context';

export function StructuredOutputCodemodScripts() {
  const { selection, setSelection } = useStructuredOutputContext();
  const codemodSelection: SelectionItem[] = selection.codemod_scripts || [];
  const { message } = useAssistantMessageContext();
  const files = message.metadata?.resolved?.codemod_scripts || [];

  return (
    <>
      {files.map((file, i) => {
        const sel = codemodSelection.find(
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
                const prevCodemod: SelectionItem[] = prev.codemod_scripts || [];
                const idx = prevCodemod.findIndex(
                  (p: SelectionItem) => p.path === file.path
                );
                let updatedCodemod: SelectionItem[];
                if (idx >= 0) {
                  updatedCodemod = prevCodemod.map(
                    (p: SelectionItem, j: number) =>
                      j === idx ? { ...p, selected: newState } : p
                  );
                } else {
                  updatedCodemod = [
                    ...prevCodemod,
                    { path: file.path, selected: newState },
                  ];
                }
                return { ...prev, codemod_scripts: updatedCodemod };
              });
            }}
            icon={
              <span className='w-4 h-4 border-2 border-green-600 flex relative'>
                <span className='absolute inset-0 flex items-center justify-center'>
                  <span className='w-2 h-2 bg-green-300 rounded-full' />
                </span>
              </span>
            }
          />
        );
      })}
    </>
  );
}
