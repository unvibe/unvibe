import { Avatar } from '@/modules/ui/avatar';

export default function AvatarDemo() {
  return (
    <div>
      <h3 className='font-semibold text-xl mb-2'>🧑‍🎨 Avatar</h3>
      <div className='flex items-center gap-4'>
        <Avatar src='https://i.pravatar.cc/40' name='Ada Lovelace' size={40} />
        <Avatar name='Alan Turing' size={50} />
        <Avatar name='Eve' size={32} />
      </div>
    </div>
  );
}
