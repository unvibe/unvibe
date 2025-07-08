import { ThreadDetailsMessageListItemFile } from '../assistant-file';
import { useAssistantMessageContext } from '../assistant-message-context';
import { useStructuredOutputContext } from './context';

const normalizePath = (path: string) => {
  if (path.startsWith('./')) return path;
  return './' + path;
};

export function StructuredOutputEditFiles() {
  const metadata = useAssistantMessageContext().message.metadata;
  const { data, selection, setSelection } = useStructuredOutputContext();
  const edit_files = data.edit_files || [];

  return (
    <>
      {edit_files?.map((edit, i) => {
        const resolved = metadata?.resolved_edited_files?.find((entry) => {
          return normalizePath(entry.path) === normalizePath(edit.path);
        });

        const contentLines = edit.content.split('\n');
        const startLine = edit.insert_at - 1; // Convert to 0-based index
        const endLine = startLine + contentLines.length - 1;
        const startCharacter = 0;
        const endCharacter = contentLines[contentLines.length - 1].length;
        console.log({
          startLine,
          endLine,
          startCharacter,
          endCharacter,
          content: edit.content,
        });
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
            key={'edit_files' + edit.path + i.toString()}
            icon={
              <span className='w-4 h-4 border-2 border-emerald-600 flex items-center justify-center'>
                <span className='w-2 h-2 rounded-full bg-emerald-600' />
              </span>
            }
            data={resolved ?? edit}
            type='remove'
            decorations={!resolved ? undefined : [editInsertionDecoration]}
            selected={selection.some((p) => p.path === edit.path && p.selected)}
            setSelected={(newState) => {
              setSelection((prev) => {
                const existing = prev.find((p) => p.path === edit.path);
                if (existing) {
                  return prev.map((p) =>
                    p.path === edit.path ? { ...p, selected: newState } : p
                  );
                }
                return [...prev, { path: edit.path, selected: newState }];
              });
            }}
          />
        );
      })}
    </>
  );
}
