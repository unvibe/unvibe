import { ThreadDetailsMessageListItemFile } from '../assistant-file';
import { useAssistantMessageContext } from '../assistant-message-context';
import { useStructuredOutputContext } from './context';

export function StructuredOutputEditRanges() {
  const { data, selection, setSelection } = useStructuredOutputContext();
  const { message } = useAssistantMessageContext();
  const files = data.edit_ranges || [];
  const rangeSelection = selection.edit_ranges || [];

  return (
    <>
      {files.map((range, i) => {
        const sel = rangeSelection.find((p) => p.path === range.path);
        const resolvedRanges = message.metadata?.resolved_edited_ranges || [];
        const resolvedFile = resolvedRanges.find((r) => r.path === range.path);
        const ranges = range.edits;
        const rangesDecorations = ranges.map((edit) => ({
          start: { line: edit.start - 1, character: 0 },
          end: {
            line: edit.end - 1,
            character:
              resolvedFile?.content.split('\n')[edit.end - 1]?.length || 0,
          },
          properties: { class: 'highlighted-word' },
        }));
        return (
          <ThreadDetailsMessageListItemFile
            key={range.path + i.toString()}
            enabledEditing={true}
            icon={
              <span className='w-4 h-4 border-2 border-emerald-600 grid items-center p-px'>
                <span className='w-full h-0.5 bg-emerald-600' />
                <span className='w-full h-0.5 bg-emerald-800' />
              </span>
            }
            data={
              resolvedFile || {
                path: range.path,
                content: 'FILE IS NOT RESOLVED',
              }
            }
            type='edit'
            decorations={resolvedFile ? rangesDecorations : undefined}
            selected={!!sel?.selected}
            setSelected={(newState) => {
              setSelection((prev) => {
                const prevRanges = prev.edit_ranges || [];
                const idx = prevRanges.findIndex((p) => p.path === range.path);
                let updatedRanges: typeof prevRanges;
                if (idx >= 0) {
                  updatedRanges = prevRanges.map((p, j) =>
                    j === idx ? { ...p, selected: newState } : p
                  );
                } else {
                  updatedRanges = [
                    ...prevRanges,
                    { path: range.path, selected: newState },
                  ];
                }
                return { ...prev, edit_ranges: updatedRanges };
              });
            }}
          />
        );
      })}
    </>
  );
}
