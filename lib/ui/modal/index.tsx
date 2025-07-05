import { Portal } from 'radix-ui';
import React, { useRef } from 'react';
import { useClickOutside } from './useClickOutside';
import clsx from 'clsx';

interface ModalProps {
  children: React.ReactNode;
  onClose: () => void;
  className?: string;
}

export function Modal({ children, onClose, className }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useClickOutside(modalRef, () => {
    onClose();
  });

  return (
    <Portal.Root>
      <div className='w-full fixed inset-0 bg-black/50 z-50'>
        <div className='w-full h-full flex items-center justify-center'>
          <div
            ref={modalRef}
            className={clsx(
              'bg-background-1 text-foreground border-2 border-border rounded-3xl shadow-lg overflow-hidden',
              className
            )}
          >
            {children}
          </div>
        </div>
      </div>
    </Portal.Root>
  );
}
