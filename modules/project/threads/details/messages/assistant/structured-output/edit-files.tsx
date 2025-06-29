import { ThreadDetailsMessageListItemFile } from '../assistant-file';
import { useStructuredOutputContext } from './context';

export function StructuredOutputEditFiles() {
  const { data, selection, setSelection } = useStructuredOutputContext();
  const edit_files = data.edit_files || [];

  return (
    <>
      {edit_files?.map((edit, i) => {
        return (
          <ThreadDetailsMessageListItemFile
            icon={
              <span className='w-4 h-4 border-2 border-emerald-600 flex items-center justify-center'>
                <span className='w-2 h-2 rounded-full bg-emerald-600' />
              </span>
            }
            key={edit.path + i.toString()}
            data={edit}
            type='remove'
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
