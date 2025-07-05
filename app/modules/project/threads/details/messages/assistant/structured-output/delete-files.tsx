import { ThreadDetailsMessageListItemFile } from '../assistant-file';
import { useStructuredOutputContext } from './context';

export function StructuredOutputDeleteFiles() {
  const { data, selection, setSelection } = useStructuredOutputContext();
  const files = data.delete_files || [];
  return (
    <>
      {files.map((file, i) => (
        <ThreadDetailsMessageListItemFile
          NO_CONTENT
          icon={
            <span className='w-4 h-4 border-2 border-rose-600 flex relative'>
              <div className='rotate-45 absolute inset-0'>
                <span className='absolute inset-0 flex items-center justify-center'>
                  <span className='w-0.5 h-2 bg-rose-600 rotate-90' />
                </span>
                <span className='absolute inset-0 flex items-center justify-center'>
                  <span className='w-0.5 h-2 bg-rose-600' />
                </span>
              </div>
            </span>
          }
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
