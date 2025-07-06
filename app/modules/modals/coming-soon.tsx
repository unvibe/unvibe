import * as React from 'react';
import { Modal } from '@/lib/ui/modal';
import { Button } from '@/lib/ui/button';
import { HiOutlineSparkles } from 'react-icons/hi2';

export interface ComingSoonModalProps {
  open: boolean;
  onClose: () => void;
  featureHint?: string;
}

export function ComingSoonModal({
  open,
  onClose,
  featureHint,
}: ComingSoonModalProps) {
  if (!open) return null;
  return (
    <Modal onClose={onClose}>
      <div className='flex flex-col items-center justify-center px-10 py-12 gap-4 min-w-[300px] max-w-xs'>
        <HiOutlineSparkles className='w-12 h-12 text-yellow-400 mb-2' />
        <h2 className='text-xl font-bold mb-2'>Coming Soon!</h2>
        <p className='text-center text-foreground-2 mb-4'>
          {featureHint
            ? featureHint
            : "This feature is not available yet, but it's on the way!"}
        </p>
        <Button
          autoFocus
          onClick={onClose}
          className='mt-2 w-full'
          variant='primary'
        >
          OK
        </Button>
      </div>
    </Modal>
  );
}
