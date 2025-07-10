import { Modal } from '@/lib/ui/modal';
import { Button } from '@/lib/ui/button';
import { useState } from 'react';
import { HiPlus } from 'react-icons/hi2';
import { useAPIMutation } from '@/server/api/client';

export function ProjectAddModal({
  open,
  onClose,
  onProjectCreated,
}: {
  open: boolean;
  onClose: () => void;
  onProjectCreated: () => void;
}) {
  const [mode, setMode] = useState<'empty' | 'github'>('empty');
  const [name, setName] = useState('');
  const [githubRepo, setGithubRepo] = useState('');
  const [error, setError] = useState<string | null>(null);

  const mutation = useAPIMutation('POST /home/create-project', {
    onSuccess: (res) => {
      if (res.success) {
        setName('');
        setGithubRepo('');
        onClose();
        onProjectCreated();
      } else {
        setError(res.error || 'Failed to create project');
      }
    },
    onError: (err: Error) => {
      setError(err.message || 'Failed to create project');
    },
  });

  const handleCreate = async () => {
    setError(null);
    mutation.mutate({
      mode,
      name,
      githubRepo: mode === 'github' ? githubRepo : undefined,
    });
  };

  if (!open) return null;

  return (
    <Modal onClose={onClose} className='min-w-[400px] p-8'>
      <h2 className='text-xl font-semibold pb-4 flex items-center gap-2 text-foreground-1'>
        <HiPlus className='w-8 h-8' /> New Project
      </h2>
      <div className='flex gap-3 mb-4'>
        <Button
          variant={mode === 'empty' ? 'primary' : 'secondary'}
          onClick={() => setMode('empty')}
        >
          Create Empty
        </Button>
        <Button
          variant={mode === 'github' ? 'primary' : 'secondary'}
          onClick={() => setMode('github')}
        >
          Clone from GitHub
        </Button>
      </div>
      <div className='mb-4'>
        <label className='block text-sm mb-1'>Project Name</label>
        <input
          type='text'
          className='w-full px-3 py-2 rounded-md bg-background-2 border-none outline-none font-mono text-base mb-2'
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder='my-new-project'
          disabled={mutation.isPending}
        />
        {mode === 'github' && (
          <>
            <label className='block text-sm mb-1 mt-2'>GitHub Repo URL</label>
            <input
              type='text'
              className='w-full px-3 py-2 rounded-md bg-background-2 border-none outline-none font-mono text-base'
              value={githubRepo}
              onChange={(e) => setGithubRepo(e.target.value)}
              placeholder='e.g. https://github.com/unvibe-ai/unvibe.git'
              disabled={mutation.isPending}
            />
          </>
        )}
      </div>
      {error && <div className='text-red-500 mb-2'>{error}</div>}
      <div className='flex justify-end gap-2'>
        <Button
          onClick={onClose}
          disabled={mutation.isPending}
          variant='secondary'
        >
          Cancel
        </Button>
        <Button
          onClick={handleCreate}
          isLoading={mutation.isPending}
          disabled={!name}
          variant='primary'
        >
          Create
        </Button>
      </div>
    </Modal>
  );
}
