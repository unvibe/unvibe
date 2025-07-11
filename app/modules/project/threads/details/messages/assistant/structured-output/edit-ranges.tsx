import { ThreadDetailsMessageListItemFile } from '../assistant-file';
import { useStructuredOutputContext } from './context';

export function StructuredOutputEditRanges() {
  const { data, selection, setSelection } = useStructuredOutputContext();
  const files = data.edit_ranges || [];
  const rangeSelection = selection.edit_ranges || [];

  return (
    <>
      {files.map((range, i) => {
        const sel = rangeSelection.find((p) => p.path === range.path);
        return (
          <ThreadDetailsMessageListItemFile
            key={range.path + i.toString()}
            enabledEditing={true}
            data={range}
            type='edit'
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
