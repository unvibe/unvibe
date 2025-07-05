import { Modal } from '../../../../lib/ui/modal';
import { Button } from '../../../../lib/ui';
import { Select } from '@/lib/ui/select';
import { HiX } from 'react-icons/hi';
import { noop } from '@/lib/core/noop';
import { TiFolder } from 'react-icons/ti';
import { useMemo, useState } from 'react';
import { useProject } from '../provider';
import { useAPIMutation } from '@/server/api/client';
import { useParams } from '@/lib/next/navigation';

export function SystemPartModal({
  setIsShowing,
}: {
  setIsShowing: (isShowing: boolean) => void;
}) {
  const project_id = useParams().project_id as string;
  const [type, setType] = useState<'raw' | 'file'>('raw');
  const [value, setValue] = useState('');
  const [key, setKey] = useState('');
  const { mutate } = useAPIMutation('POST /projects/save-system-part');
  const project = useProject();
  const filesOptions = useMemo(() => {
    return project?.paths.map((file) => ({
      label: file,
      value: file,
      group: 'Files',
      groupIcon: <TiFolder className='w-5 h-5' />,
    }));
  }, [project.paths]);
  return (
    <Modal onClose={noop}>
      <div className='p-5'>
        <div className='flex items-center justify-between gap-4 mb-4'>
          <h2 className='text-2xl font-bold'>Add System Part</h2>
          <button className='p-1 flex items-center justify-center rounded-full bg-background-1'>
            <HiX
              className='w-5 h-5 text-foreground-2'
              onClick={() => setIsShowing(false)}
            />
          </button>
        </div>
        <div className='grid gap-2'>
          <div className='flex items-stretch gap-2'>
            <input
              type='text'
              placeholder='part key (id)'
              className='border-2 border-border p-1 px-2 bg-background-2 rounded-xl'
              value={key}
              onChange={(e) => setKey(e.target.value)}
            />
            <Select
              placeholder='type'
              value={type}
              style={{ width: '100px' }}
              onChange={(e) => setType(e as 'raw' | 'file')}
              options={[
                { label: 'Raw', value: 'raw' },
                { label: 'File', value: 'file' },
              ]}
            />
          </div>
          {type === 'raw' && (
            <textarea
              placeholder={'part value'}
              className='border-2 border-border p-1 px-2 bg-background-2 rounded-xl'
              onChange={(e) => setValue(e.target.value)}
              value={value}
            />
          )}
          {type === 'file' && (
            <Select
              placeholder='select file'
              value={value}
              style={{ width: '100%' }}
              onChange={(newValue) => setValue(newValue)}
              options={filesOptions}
            />
          )}
          <div>
            <Button
              variant='info'
              onClick={() => {
                if (value.trim() && key.trim() && project_id && type) {
                  mutate({
                    projectId: project_id,
                    type: type,
                    key: key.trim(),
                    value: value.trim(),
                  });
                }
              }}
            >
              Save
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
