import { Button } from '@/lib/ui';
import { Code } from '@/lib/ui/code/base';
import { Modal } from '@/lib/ui/modal';
import { FileActionProps } from '@/plugins/_types/plugin-client';
import { useAPIMutation } from '@/server/api/client';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  MdChevronRight,
  MdOutlineCheckCircle,
  MdOutlineDifference,
} from 'react-icons/md';

export function GitDiffAction({ data, projectId }: FileActionProps) {
  const [isShowingDiff, setIsShowingDiff] = useState(false);
  const { mutate } = useAPIMutation('POST /projects/diff-content');
  const [diff, setDiff] = useState<string | null>(null);
  const [isUpToDate, setIsUpToDate] = useState(false);

  useEffect(() => {
    mutate(
      { ...data, content: data.content || '', projectId },
      {
        onError(error) {
          console.error('Error fetching diff:', error);
        },
        onSuccess(data) {
          if (data) {
            setDiff(data.diff || null);
            setIsUpToDate(data.diff === '' && data.fileExists);
          }
        },
      }
    );
  }, [data, mutate, projectId]);

  return (
    <>
      <button
        className='bg-background-1/50 rounded-xl p-2 cursor-pointer flex items-center gap-1'
        onClick={() => {
          if (isShowingDiff) {
            setIsShowingDiff(!isShowingDiff);
          } else {
            mutate(
              { ...data, content: data.content || '', projectId },
              {
                onSuccess(data) {
                  if (data) {
                    setDiff(data.diff || null);
                    if (data.diff) {
                      setIsShowingDiff(true);
                    } else {
                      toast('No diff found');
                    }
                  }
                },
              }
            );
          }
        }}
      >
        <MdOutlineDifference className='w-5 h-5' />
        <span className='transform rotate-90'>
          {isUpToDate ? (
            <MdOutlineCheckCircle className='w-5 h-5 transform -rotate-90 dark:text-emerald-700' />
          ) : (
            <MdChevronRight className='w-5 h-5' />
          )}
        </span>
      </button>
      {isShowingDiff && diff && (
        <Modal onClose={() => setIsShowingDiff(false)}>
          <div className='relative pb-8'>
            <div className='max-h-[50vh] overflow-y-auto pb-[3.25rem] p-5 max-w-4xl'>
              <div className='text-xs'>
                <Code code={diff} isDiff />
              </div>
            </div>
            <div className='absolute inset-x-0 bottom-0 w-full border-t bg-background-2 px-4 py-2 border-border'>
              <Button onClick={() => setIsShowingDiff(false)}>Close</Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
