import { ProfileCard } from '@/modules/ui/profile-card';

export default function ProfileDemo() {
  return (
    <div className='min-h-screen flex items-center justify-center bg-background text-foreground px-4 py-10'>
      <ProfileCard
        name='Ada Lovelace'
        email='ada@alabs.dev'
        role='Admin'
        bio='Pioneer of computing. Passionate about math, code, and solving hard problems.'
        avatar='https://i.pravatar.cc/120?img=5'
      />
    </div>
  );
}
