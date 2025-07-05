import { useState } from 'react';
import { Modal } from '@/lib/ui/modal';
import { Button } from '@/lib/ui/button';

export default function ModalDemo() {
  const [isModalOpen, setModalOpen] = useState(false);
  return (
    <div className='min-h-screen container mx-auto py-10 px-6'>
      <h1 className='text-3xl font-semibold mb-6'>🪟 Modal Demo</h1>
      <Button
        onClick={() => setModalOpen(true)}
        className='animate-bounce-slow'
      >
        Open Modal
      </Button>
      {isModalOpen && (
        <Modal onClose={() => setModalOpen(false)}>
          <div className='p-6 animate-fade-in rounded-xl shadow bg-background-1 text-foreground'>
            <h3 className='text-lg font-medium mb-2 flex items-center gap-2'>
              ✨ Modal Content
            </h3>
            <p>
              Surprise! This is a friendly modal popup. You can close it when
              you are done.
            </p>
            <Button className='mt-4' onClick={() => setModalOpen(false)}>
              Close
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
