import { Badge } from '@/lib/ui/badge';

export default function BadgeDemo() {
  return (
    <div>
      <h3 className='font-semibold text-xl mb-2'>🏷️ Badge</h3>
      <Badge>Default</Badge>
      <Badge color='primary' className='ml-2'>
        Primary
      </Badge>
      <Badge color='success' className='ml-2'>
        Success
      </Badge>
      <Badge color='danger' className='ml-2'>
        Danger
      </Badge>
      <Badge color='warning' className='ml-2'>
        Warning
      </Badge>
    </div>
  );
}
