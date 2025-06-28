import { ThreadDetailsMessageListItemFile } from '../assistant-file';
import { useStructuredOutputContext } from './context';

export function StructuredOutputDeleteFiles() {
  const { data, selection, setSelection } = useStructuredOutputContext();
  const files = data.delete_files || [];
  return (
    <>
      {files.map((file, i) => (
        <ThreadDetailsMessageListItemFile
          key={file.path + i.toString()}
          data={file}
          type='remove'
          selected={selection.some((p) => p.path === file.path && p.selected)}
          setSelected={(newState) => {
            setSelection((prev) => {
              const existing = prev.find((p) => p.path === file.path);
              if (existing) {
                return prev.map((p) =>
                  p.path === file.path ? { ...p, selected: newState } : p
                );
              }
              return [...prev, { path: file.path, selected: newState }];
            });
          }}
        />
      ))}
    </>
  );
}
