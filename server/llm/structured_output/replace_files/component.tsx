import { ThreadDetailsMessageListItemFile } from '../_shared/virtual-file';
import { useAssistantMessageContext } from '../_shared/assistant-message-context';
import { useStructuredOutputContext } from '../_shared/structured-output-context';

export function StructuredOutputReplaceFiles() {
  const { data, selection, setSelection } = useStructuredOutputContext();
  const files = data.replace_files || [];
  const replaceSelection = selection.replace_files || [];
  const { message } = useAssistantMessageContext();

  return (
    <>
      {files.map((file, i) => {
        const sel = replaceSelection.find((p) => p.path === file.path);
        const git = message.metadata?.diffs?.replace_files?.find(
          (d) => d.path === file.path
        )?.data;
        return (
          <ThreadDetailsMessageListItemFile
            key={file.path + i.toString()}
            enabledEditing={true}
            git={git}
            icon={
              <span className='w-4 h-4 border-2 border-emerald-600 flex relative'>
                <span className='absolute inset-0 flex items-center justify-center'>
                  <span className='w-0.5 h-2 bg-emerald-600 rotate-90' />
                </span>
                <span className='absolute inset-0 flex items-center justify-center'>
                  <span className='w-0.5 h-2 bg-emerald-600' />
                </span>
              </span>
            }
            data={file}
            type='add'
            selected={!!sel?.selected}
            setSelected={(newState) => {
              setSelection((prev) => {
                // Defensive: always copy previous
                const prevReplace = prev.replace_files || [];
                const idx = prevReplace.findIndex((p) => p.path === file.path);
                let updatedReplace: typeof prevReplace;
                if (idx >= 0) {
                  updatedReplace = prevReplace.map((p, j) =>
                    j === idx ? { ...p, selected: newState } : p
                  );
                } else {
                  updatedReplace = [
                    ...prevReplace,
                    { path: file.path, selected: newState },
                  ];
                }
                return { ...prev, replace_files: updatedReplace };
              });
            }}
          />
        );
      })}
    </>
  );
}
