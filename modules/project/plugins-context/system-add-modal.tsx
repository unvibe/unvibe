import { Modal } from '@/modules/ui/modal';
import { useProject } from '../provider';
import { useState } from 'react';
import { useAPIMutation } from '@/server/api/client';
import { useParams } from 'react-router';

export function SystemAddModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const project = useProject();
  const [type, setType] = useState<'raw' | 'file'>('raw');
  const [key, setKey] = useState('');
  const [value, setValue] = useState('');
  const [fileQuery, setFileQuery] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const projectId = useParams().project_id as string;

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
              checked={type === 'raw'}
              onChange={() => setType('raw')}
              className='accent-blue-600'
            />
            Raw
          </label>
          <label className='flex items-center gap-1'>
            <input
              type='radio'
              checked={type === 'file'}
              onChange={() => setType('file')}
              className='accent-blue-600'
            />
            File
          </label>
        </div>
        <div className='mb-3'>
          <input
            className='w-full border px-2 py-1 rounded mb-2'
            placeholder='Key'
            value={key}
            onChange={(e) => setKey(e.target.value)}
            required
          />
        </div>
        {type === 'file' ? (
          <div className='mb-3'>
            <input
              className='w-full border px-2 py-1 rounded mb-1'
              placeholder='Start typing to search files...'
              value={fileQuery}
              onChange={(e) => setFileQuery(e.target.value)}
              list='project-file-list'
              required
            />
            <datalist id='project-file-list'>
              {fileOptions.map((f) => (
                <option key={f} value={f} />
              ))}
            </datalist>
          </div>
        ) : (
          <div className='mb-3'>
            <textarea
              className='w-full border px-2 py-1 rounded'
              placeholder='Description/value'
              rows={4}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              required
            />
          </div>
        )}
        <div className='flex gap-2 mt-2'>
          <button
            type='submit'
            className='bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-60'
            disabled={loading}
          >
            {loading ? 'Adding...' : 'Add'}
          </button>
          <button
            className='text-gray-500 px-4 py-2 rounded'
            type='button'
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
        {message && <div className='mt-2 text-sm text-blue-700'>{message}</div>}
      </form>
    </Modal>
  );
}
