import { Modal } from '@/lib/ui/modal';
import { useProject } from '../provider';
import { useState } from 'react';
import { useAPIMutation } from '@/server/api/client';
import { useParams } from 'react-router';
import { useQueryClient } from '@tanstack/react-query';

export function SystemAddModal({
  open,
  onClose,
  queryKeyToRefetch,
}: {
  open: boolean;
  onClose: () => void;
  queryKeyToRefetch?: unknown[];
}) {
  const project = useProject();
  const [type, setType] = useState<'raw' | 'file'>('raw');
  const [key, setKey] = useState('');
  const [value, setValue] = useState('');
  const [fileQuery, setFileQuery] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const projectId = useParams().project_id as string;
  const queryClient = useQueryClient();

  const fileOptions = project.paths.filter((p) => p.includes(fileQuery));

  // Setup mutation
  const {
    mutate: addSystem,
    isPending: loading,
    error,
  } = useAPIMutation('POST /custom-plugin/new-system', {
    onSuccess: () => {
      setMessage('System instruction added!');
      setKey('');
      setValue('');
      setFileQuery('');
      onClose();
      // Refetch project context so UI updates
      if (queryKeyToRefetch)
        queryClient.invalidateQueries({ queryKey: queryKeyToRefetch });
    },
    onError: () => {
      setMessage(error?.message || 'Failed to add system instruction');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    addSystem({
      projectId: projectId,
      type,
      key,
      value: type === 'file' ? fileQuery : value,
    });
  };

  if (!open) return null;
  return (
    <Modal onClose={onClose} className='max-w-lg mx-auto p-5 w-full'>
      <form onSubmit={handleSubmit}>
        <h3 className='text-lg font-semibold mb-3'>Add System Instruction</h3>
        <div className='mb-3 flex gap-4'>
          <label className='flex items-center gap-1'>
            <input
              type='radio'
              name='type'
              value='raw'
              checked={type === 'raw'}
              onChange={() => setType('raw')}
            />
            Raw
          </label>
          <label className='flex items-center gap-1'>
            <input
              type='radio'
              name='type'
              value='file'
              checked={type === 'file'}
              onChange={() => setType('file')}
            />
            File
          </label>
        </div>
        <div className='mb-3'>
          <input
            className='w-full border rounded p-2'
            placeholder='Key (name)'
            value={key}
            onChange={(e) => setKey(e.target.value)}
            required
          />
        </div>
        {type === 'file' ? (
          <input
            className='w-full border rounded p-2 mb-2'
            placeholder='File path...'
            value={fileQuery}
            onChange={(e) => setFileQuery(e.target.value)}
            required
            list='system-file-options'
          />
        ) : (
          <textarea
            className='w-full border rounded p-2 mb-2'
            placeholder='System prompt...'
            value={value}
            required
            onChange={(e) => setValue(e.target.value)}
            rows={5}
          />
        )}
        {type === 'file' && (
          <datalist id='system-file-options'>
            {fileOptions.map((f) => (
              <option value={f} key={f} />
            ))}
          </datalist>
        )}
        <button
          type='submit'
          className='px-4 py-2 bg-blue-600 text-white rounded shadow disabled:opacity-40'
          disabled={loading}
        >
          Add
        </button>
        {message && (
          <div className='mt-2 text-center text-blue-700'>{message}</div>
        )}
      </form>
    </Modal>
  );
}
