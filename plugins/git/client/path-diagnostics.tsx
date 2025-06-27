import { FileActionProps } from '@/plugins/_types/plugin-client';
import { useAPIMutation } from '@/server/api/client';
import { useEffect, useState } from 'react';
import gitDiffParser from 'gitdiff-parser';
import clsx from 'clsx';

function LinesIndicator({
  added,
  removed,
}: {
  added: number;
  removed: number;
}) {
  return (
    <div
      className={clsx(
        'flex items-center gap-1 text-xs font-mono text-foreground-2'
      )}
    >
      <div className={clsx('text-emerald-600')}>+{added}</div>
      <div className={clsx('text-rose-600')}>-{removed}</div>
      <div className='flex gap-px'>
        <div className='w-2 h-2 bg-emerald-700' />
        <div className='w-2 h-2 bg-emerald-700' />
        <div className='w-2 h-2 bg-rose-700' />
        <div className='w-2 h-2 bg-rose-700' />
      </div>
    </div>
  );
}

export function GitPathDiagnostics({ data, projectId }: FileActionProps) {
  const [isNewFile, setIsNewFile] = useState(false);
  const [totalAdded, setTotalAdded] = useState(0);
  const [totalRemoved, setTotalRemoved] = useState(0);
  const __content = data.content;
  const { mutate } = useAPIMutation('POST /projects/diff-content');

  useEffect(() => {
    mutate(
      { ...data, content: data.content || '', projectId },
      {
        onError(error) {
          console.error('Error fetching diff:', error);
        },
        onSuccess(data) {
          if (data) {
            setIsNewFile(data.diff === '' && !data.fileExists);
            if (data.fileExists) {
              const diffData = gitDiffParser.parse(data.diff);
              const totalAdded = diffData[0]?.hunks.reduce(
                (acc, hunk) =>
                  acc +
                  hunk.changes.reduce(
                    (acc, change) => acc + ('isInsert' in change ? 1 : 0),
                    0
                  ),
                0
              );
              const totalRemoved = diffData[0]?.hunks.reduce(
                (acc, hunk) =>
                  acc +
                  hunk.changes.reduce(
                    (acc, change) => acc + ('isDelete' in change ? 1 : 0),
                    0
                  ),
                0
              );
              setTotalAdded(totalAdded);
              setTotalRemoved(totalRemoved);
            }
          }
        },
      }
    );
  }, [data, mutate, projectId]);

  return (
    <LinesIndicator
      added={isNewFile ? __content?.split('\n').length || 0 : totalAdded || 0}
      removed={totalRemoved || 0}
    />
  );
}
