import { ThreadDetailsMessageListItemFile } from '../assistant-file';
import { useStructuredOutputContext } from './context';

export function StructuredOutputReplaceFiles() {
  const { data, selection, setSelection } = useStructuredOutputContext();
  const files = data.replace_files || [];
  return (
    <>
      {files.map((file, i) => (
        <ThreadDetailsMessageListItemFile
          key={file.path + i.toString()}
          enabledEditing={true}
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
