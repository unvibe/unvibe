import { ThreadDetailsMessageListItemFile } from '@/lib/react/structured-output/virtual-file';
import { useAssistantMessageContext } from '@/lib/react/structured-output/assistant-message-context';
import {
  useStructuredOutputContext,
  SelectionItem,
} from '@/lib/react/structured-output/structured-output-context';
import { key } from './shared';
import type { CodemodScripts } from '.';

export * from './shared';

Component.getDefaultState = (
  data: CodemodScripts
): Record<string, SelectionItem[]> => {
  return {
    [key]: data?.map((item) => ({
      path: item.path,
      selected: true,
    })),
  };
};

export function Component() {
  const { selection, setSelection } = useStructuredOutputContext();
  const codemodSelection: SelectionItem[] = selection?.[key] || [];
  const { message } = useAssistantMessageContext();
  const files = message.metadata?.resolved?.[key] || [];
  const git = message.metadata?.diffs?.[key] || [];

  return (
    <>
      {files.map((file, i) => {
        const sel = codemodSelection.find(
          (p: SelectionItem) => p.path === file.path
        );
        return (
          <ThreadDetailsMessageListItemFile
            key={file.path + i.toString()}
            git={git.find((d) => d.path === file.path)?.data}
            enabledEditing={true}
            data={file}
            selected={!!sel?.selected}
            setSelected={(newState) => {
              setSelection((prev) => {
                const prevCodemod: SelectionItem[] = prev.codemod_scripts || [];
                const idx = prevCodemod.findIndex(
                  (p: SelectionItem) => p.path === file.path
                );
                let updatedCodemod: SelectionItem[];
                if (idx >= 0) {
                  updatedCodemod = prevCodemod.map(
                    (p: SelectionItem, j: number) =>
                      j === idx ? { ...p, selected: newState } : p
                  );
                } else {
                  updatedCodemod = [
                    ...prevCodemod,
                    { path: file.path, selected: newState },
                  ];
                }
                return { ...prev, codemod_scripts: updatedCodemod };
              });
            }}
            icon={
              <span className='w-4 h-4 border-2 border-purple-600 flex relative'>
                <span className='absolute inset-0 flex items-center justify-center'>
                  <span className='w-0.5 h-2 bg-purple-600 rotate-90' />
                </span>
                <span className='absolute inset-0 flex items-center justify-center'>
                  <span className='w-0.5 h-2 bg-purple-600' />
                </span>
              </span>
            }
          />
        );
      })}
    </>
  );
}
