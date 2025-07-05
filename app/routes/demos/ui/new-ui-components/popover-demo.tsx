import { Button } from '@/lib/ui/button';
import { Popover } from '@/lib/ui/popover';
import { Badge } from '@/lib/ui/badge';

export default function PopoverDemo() {
  return (
    <div>
      <h3 className='font-semibold text-xl mb-2'>🪟 Popover</h3>
      <Popover
        trigger={<Button>Show Popover</Button>}
        content={
          <div className='p-2'>
            Popover <Badge color='primary'>Content</Badge>
          </div>
        }
        side='bottom'
      />
    </div>
  );
}
