import { Tag } from '@/modules/ui/tag';

export default function TagDemo() {
  return (
    <div>
      <h3 className='font-semibold text-xl mb-2'>🔖 Tag/Chip</h3>
      <Tag color='primary'>Primary</Tag>
      <Tag color='success' className='ml-2'>
        Success
      </Tag>
      <Tag color='danger' className='ml-2'>
        Danger
      </Tag>
      <Tag color='warning' className='ml-2'>
        Warning
      </Tag>
      <Tag className='ml-2' onRemove={() => alert('Tag removed!')}>
        Removable
      </Tag>
    </div>
  );
}
