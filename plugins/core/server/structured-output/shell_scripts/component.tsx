import { TbTerminal } from 'react-icons/tb';
import { Checkbox } from '@/lib/ui';
import {
  SelectionItem,
  useStructuredOutputContext,
} from '@/lib/react/structured-output/structured-output-context';
import { key } from './shared';
import type { ShellScripts } from '.';

export * from './shared';

Component.getDefaultState = (
  data: ShellScripts
): Record<string, SelectionItem[]> => {
  return {
    [key]: data?.map((item) => ({
      path: item,
      selected: true,
    })),
  };
};

export function Component() {
  const { data, selection, setSelection } = useStructuredOutputContext();
  const scripts = (data?.[key] || []) as ShellScripts;
  const scriptSelection = selection?.[key] || [];

  if (!Array.isArray(scripts) || scripts.length === 0) return null;

  return (
    <div className='grid gap-2'>
      <div className='bg-background-1 rounded-2xl p-4 relative'>
        <div>
          <TbTerminal className='w-5 h-5 text-foreground-2 shrink-0 mb-4' />
        </div>
        <div className='grid gap-2 text-xs font-mono'>
          {scripts.map((script) => {
            const sel = scriptSelection.find((s) => s.path === script);
            const checked = !!sel?.selected;
            return (
              <div key={script} className='flex items-center gap-2'>
                <Checkbox
                  className='!w-5 !h-5 !rounded-full shrink-0'
                  checked={checked}
                  onCheckedChange={() =>
                    setSelection((prev) => {
                      const prevScripts = prev.shell_scripts || [];
                      const idx = prevScripts.findIndex(
                        (s) => s.path === script
                      );
                      let updatedScripts: typeof prevScripts;
                      if (idx >= 0) {
                        updatedScripts = prevScripts.map((s, j) =>
                          j === idx ? { ...s, selected: !sel?.selected } : s
                        );
                      } else {
                        updatedScripts = [
                          ...prevScripts,
                          { path: script, selected: !sel?.selected },
                        ];
                      }
                      return { ...prev, shell_scripts: updatedScripts };
                    })
                  }
                />
                <span>{script}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
