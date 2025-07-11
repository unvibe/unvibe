import { ThreadDetailsMessageListItemFile } from '../assistant-file';
import { useStructuredOutputContext } from './context';

export function StructuredOutputEditFiles() {
  const { data, selection, setSelection } = useStructuredOutputContext();
  const files = data.edit_files || [];
  const editSelection = selection.edit_files || [];

  return (
    <>
      {files.map((file, i) => {
        const sel = editSelection.find((p) => p.path === file.path);
        return (
          <ThreadDetailsMessageListItemFile
            key={file.path + i.toString()}
            enabledEditing={true}
            data={file}
            type='edit'
            selected={!!sel?.selected}
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
