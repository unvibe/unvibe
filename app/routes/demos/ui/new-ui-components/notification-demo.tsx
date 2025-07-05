import { Button } from '@/lib/ui/button';
import toast from 'react-hot-toast';

export default function NotificationDemo() {
  return (
    <div>
      <h3 className='font-semibold text-xl mb-2'>🔔 Notification/Toast</h3>
      <Button onClick={() => toast('This is a notification!', { icon: '🔔' })}>
        Show Notification
      </Button>
    </div>
  );
}
