import { ThreadDetailsMessageListItemFile } from '../assistant-file';
import { useAssistantMessageContext } from '../assistant-message-context';
import { useStructuredOutputContext } from './context';

export function StructuredOutputEditFiles() {
  const { data, selection, setSelection } = useStructuredOutputContext();
  const { message } = useAssistantMessageContext();
  const files = data.edit_files || [];
  const editSelection = selection.edit_files || [];

  return (
    <>
      {files.map((file, i) => {
        const sel = editSelection.find((p) => p.path === file.path);
        const resolvedFiles = message.metadata?.resolved_edited_files || [];
        const resolvedFile = resolvedFiles.find((r) => r.path === file.path);

        const contentLines = file.content.split('\n');
        const startLine = file.insert_at - 1; // Convert to 0-based index
        const endLine = startLine + contentLines.length - 1;
        const startCharacter = 0;
        const endCharacter =
          resolvedFile?.content.split('\n')[endLine]?.length || 0;
        const editInsertionDecoration = {
          start: { line: startLine, character: startCharacter },
          end: {
            line: endLine,
            character: endCharacter,
          },
          properties: { class: 'highlighted-word' },
        };
        return (
          <ThreadDetailsMessageListItemFile
            key={file.path + i.toString()}
            enabledEditing={true}
            icon={
              <span className='w-4 h-4 border-2 border-emerald-600 flex items-center justify-center'>
                <span className='w-2 h-2 rounded-full bg-emerald-600' />
              </span>
            }
            data={
              resolvedFile || {
                path: file.path,
                content: 'FILE IS NOT RESOLVED',
              }
            }
            type='edit'
            selected={!!sel?.selected}
            decorations={!resolvedFile ? undefined : [editInsertionDecoration]}
            setSelected={(newState) => {
              setSelection((prev) => {
                const prevEdit = prev.edit_files || [];
                const idx = prevEdit.findIndex((p) => p.path === file.path);
                let updatedEdit: typeof prevEdit;
                if (idx >= 0) {
                  updatedEdit = prevEdit.map((p, j) =>
                    j === idx ? { ...p, selected: newState } : p
                  );
                } else {
                  updatedEdit = [
                    ...prevEdit,
                    { path: file.path, selected: newState },
                  ];
                }
                return { ...prev, edit_files: updatedEdit };
              });
            }}
          />
        );
      })}
    </>
  );
}
