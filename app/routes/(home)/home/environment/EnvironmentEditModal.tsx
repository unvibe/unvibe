import { Modal } from '@/lib/ui/modal';
import { Button } from '@/lib/ui/button';
import { TextInput } from '@/lib/ui/input';
import { Alert } from '@/lib/ui/alert';
import * as React from 'react';
import { MdLockOpen } from 'react-icons/md';
import { useAPIMutation, useAPIQuery } from '@/server/api/client';

export function EnvironmentEditModal({
  open,
  envVar,
  onClose,
}: {
  open: boolean;
  envVar: { key: string; value: string } | null;
  onClose: () => void;
}) {
  const [editValue, setEditValue] = React.useState('');
  const { refetch } = useAPIQuery('GET /home/info');

  const mutation = useAPIMutation('POST /home/env-update', {
    onSuccess: () => {
      onClose();
      refetch();
    },
  });

  const handleSave = () => {
    if (!envVar) return;
    mutation.mutate({ key: envVar.key, value: editValue });
  };

  if (!open || !envVar) return null;
  return (
    <Modal onClose={onClose} className='w-[450px] p-8'>
      <h2 className='text-lg font-semibold flex items-center gap-2'>
        <MdLockOpen /> <span>Edit environment variable</span>
      </h2>
      <div className='py-4'>
        <span className='font-mono bg-background-2 px-2 py-1 rounded'>
          {envVar.key}
        </span>
      </div>
      {!!envVar.value && (
        <Alert variant='warning' className='mb-4' opacity='50'>
          <b>Warning:</b> This variable already has a value. Overwriting it is{' '}
          <b>irreversible</b>.<br />
          Are you sure you want to continue?
        </Alert>
      )}
      {mutation.isError && (
        <Alert variant='error' className='mb-4'>
          Failed to update environment variable.
        </Alert>
      )}
      <TextInput
        label='Value'
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        autoFocus
        disabled={mutation.isPending}
      />
      <div className='mt-6 flex gap-2 justify-end'>
        <Button onClick={onClose} disabled={mutation.isPending}>
          Cancel
        </Button>
        <Button
          variant='success'
          disabled={
            !editValue || mutation.isPending || editValue === envVar.value
          }
          isLoading={mutation.isPending}
          onClick={handleSave}
        >
          Save
        </Button>
      </div>
    </Modal>
  );
}
