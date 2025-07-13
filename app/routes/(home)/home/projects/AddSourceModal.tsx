import { Modal } from '@/lib/ui/modal';
import { Button } from '@/lib/ui/button';
import { useState, useEffect } from 'react';
import { useAPIMutation, useAPIQuery } from '@/server/api/client';
import { HiFolder, HiChevronLeft, HiPlus } from 'react-icons/hi';
import { HiTrash } from 'react-icons/hi2';

export function AddSourceModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [pathStack, setPathStack] = useState<string[]>([]);
  const [currentPath, setCurrentPath] = useState<string>('');
  const [dirs, setDirs] = useState<{ name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sourcesQuery = useAPIQuery('GET /home/list-sources', {});
  const sources = sourcesQuery.data?.sources || [];
  const addSourceMutation = useAPIMutation('POST /home/add-source');
  const removeSourceMutation = useAPIMutation('POST /home/remove-source');

  const mutation = useAPIMutation('POST /home/ls', {
    onSuccess: (res) => {
      if (res.success) {
        setDirs((res.files || []).filter((f) => f.type === 'dir'));
        setError(null);
      } else {
        setDirs([]);
        setError(res.error || 'Failed to list directory');
      }
      setLoading(false);
    },
    onError: (err: Error) => {
      setDirs([]);
      setError(err.message || 'Failed to list directory');
      setLoading(false);
    },
  });

  useEffect(() => {
    if (open) {
      setPathStack([]);
      setCurrentPath('');
      setLoading(true);
      mutation.mutate({});
    }
  }, [open]);

  useEffect(() => {
    if (open && !loading) {
      setLoading(true);
      mutation.mutate({ path: currentPath });
    }
  }, [currentPath]);

  const handleDirClick = (name: string) => {
    const nextPath = currentPath ? currentPath + '/' + name : name;
    setPathStack((stack) => [...stack, currentPath]);
    setCurrentPath(nextPath);
  };

  const handleDirAdd = (name: string) => {
    const fullPath = currentPath ? currentPath + '/' + name : name;
    addSourceMutation.mutate(
      {
        path: fullPath,
      },
      {
        onSuccess: () => {
          onClose();
          sourcesQuery.refetch();
        },
      }
    );
  };

  const handleDirRemove = (name: string) => {
    const fullPath = currentPath ? currentPath + '/' + name : name;
    removeSourceMutation.mutate(
      {
        path: fullPath,
      },
      {
        onSuccess: () => {
          onClose();
          sourcesQuery.refetch();
        },
      }
    );
  };

  const handleBack = () => {
    if (pathStack.length === 0) {
      setCurrentPath('');
      return;
    }
    const prev = pathStack[pathStack.length - 1];
    setPathStack((stack) => stack.slice(0, -1));
    setCurrentPath(prev);
  };

  const checkAlreadyExists = (path: string) => {
    const _currentPath = currentPath ? currentPath + '/' : '';
    return sources.some((source) => source === _currentPath + path);
  };

  if (!open) return null;

  return (
    <Modal onClose={onClose} className='w-[520px] p-8'>
      <div className='flex items-center gap-2 mb-4 p-2'>
        <Button
          variant='secondary'
          onClick={handleBack}
          className='!p-2'
          disabled={currentPath === '' && pathStack.length === 0}
        >
          <HiChevronLeft className='w-4 h-4' />
        </Button>
        <span className='font-mono text-foreground-2 text-xs truncate'>
          {currentPath ? '~/' + currentPath : '~'}
        </span>
      </div>
      {loading ? (
        <div className='h-[400px] flex items-center justify-center p-4 text-center text-foreground-2'>
          Loading...
        </div>
      ) : error ? (
        <div className='h-[400px] flex items-center justify-center text-red-500 p-4 text-center'>
          {error}
        </div>
      ) : (
        <div className='h-[400px] overflow-auto divide-y divide-border-2'>
          {dirs.map((dir) => {
            const exists = checkAlreadyExists(dir.name);
            return (
              <div
                key={dir.name}
                className='flex items-center gap-2 p-2 hover:bg-background-2 rounded text-foreground-1'
              >
                <Button
                  variant={exists ? 'danger' : 'secondary'}
                  className='mr-2 !p-2'
                  onClick={() => {
                    if (exists) {
                      handleDirRemove(dir.name);
                    } else {
                      handleDirAdd(dir.name);
                    }
                  }}
                  title='Select this folder as source'
                  isLoading={
                    addSourceMutation.isPending ||
                    removeSourceMutation.isPending
                  }
                >
                  {exists ? (
                    <HiTrash className='w-4 h-4' />
                  ) : (
                    <HiPlus className='w-4 h-4' />
                  )}
                </Button>
                <div
                  className='flex items-center gap-2 flex-1 cursor-pointer'
                  onClick={() => handleDirClick(dir.name)}
                  title='Click to open'
                >
                  <HiFolder className='w-5 h-5 text-blue-400' />
                  <span className='truncate'>{dir.name}</span>
                </div>
              </div>
            );
          })}
          {dirs.length === 0 && (
            <div className='p-4 text-center text-foreground-2'>No folders</div>
          )}
        </div>
      )}
      <div className='flex justify-end gap-2 mt-4'>
        <Button onClick={onClose} variant='secondary'>
          Close
        </Button>
      </div>
    </Modal>
  );
}
