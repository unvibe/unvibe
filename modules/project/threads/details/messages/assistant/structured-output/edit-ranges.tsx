import { ThreadDetailsMessageListItemFile } from '../assistant-file';
import { useAssistantMessageContext } from '../assistant-message-context';
import { useStructuredOutputContext } from './context';

export function StructuredOutputEditRanges() {
  const { data, selection, setSelection } = useStructuredOutputContext();
  const metadata = useAssistantMessageContext().message.metadata;
  const edit_ranges = data.edit_ranges || [];

  console.log(metadata?.resolved_edited_ranges);
  // If no edit_ranges, render nothing
  if (!edit_ranges.length) return null;

  return (
    <>
      {edit_ranges.map((entry) => {
        const resolved = metadata?.resolved_edited_ranges?.find((r) => {
          return r.path === entry.path;
        });
        return (
          <ThreadDetailsMessageListItemFile
            icon={
              <span className='w-4 h-4 border-2 border-emerald-600 grid items-center p-px'>
                <span className='w-full h-0.5 bg-emerald-600' />
                <span className='w-full h-0.5 bg-emerald-800' />
              </span>
            }
            key={entry.path}
            data={{
              path: entry.path,
              content:
                resolved?.content ||
                entry.edits.map((e) => e.content).join('\n\n'),
            }}
            type='edit'
            decorations={
              !resolved
                ? undefined
                : entry.edits.map((edit) => ({
                    start: { line: edit.start - 1, character: 0 },
                    end: {
                      line: edit.end - 1 + edit.content.split('\n').length - 1,
                      character:
                        edit.content.split('\n')[
                          edit.content.split('\n').length - 1
                        ].length,
                    },
                    properties: { class: 'highlighted-word' },
                  }))
            }
            selected={selection.some(
              (p) => p.path === entry.path && p.selected
            )}
            setSelected={(newState) => {
              setSelection((prev) => {
                const id = entry.path;
                const existing = prev.find((p) => p.path === id);
                if (existing) {
                  return prev.map((p) =>
                    p.path === id ? { ...p, selected: newState } : p
                  );
                }
                return [...prev, { path: id, selected: newState }];
              });
            }}
          />
        );
      })}
    </>
  );
}
