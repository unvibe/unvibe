import { Button } from '@/modules/ui/button';
import { Tooltip } from '@/modules/ui/tooltip';

export default function TooltipDemo() {
  return (
    <div>
      <h3 className='font-semibold text-xl mb-2'>💬 Tooltip</h3>
      <Tooltip content='This is a tooltip!'>
        <Button>Hover or focus me</Button>
      </Tooltip>
    </div>
  );
}
