import { TbTerminal } from 'react-icons/tb';
import { useStructuredOutputContext } from './context';
import { Checkbox } from '@/lib/ui';

export function StructuredOutputShellScripts() {
  const { data, selection, setSelection } = useStructuredOutputContext();
  const scripts = data.shell_scripts || [];
  const scriptSelection = selection.shell_scripts || [];

  if (scripts.length === 0) return null;

  return (
    <div className='grid gap-2'>
      <div className='bg-background-1 rounded-2xl p-4 relative'>
        <div>
          <TbTerminal className='w-5 h-5 text-foreground-2 shrink-0 mb-4' />
        </div>
        <div className='grid gap-2 text-xs font-mono'>
          {scripts.map((script) => {
            const sel = scriptSelection.find((s) => s.script === script);
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
                        (s) => s.script === script
                      );
                      let updatedScripts: typeof prevScripts;
                      if (idx >= 0) {
                        updatedScripts = prevScripts.map((s, j) =>
                          j === idx ? { ...s, selected: !sel?.selected } : s
                        );
                      } else {
                        updatedScripts = [
                          ...prevScripts,
                          { script, selected: !sel?.selected },
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
