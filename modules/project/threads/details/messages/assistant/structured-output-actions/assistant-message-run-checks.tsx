// UI for dev_propose_only agent, with full code quality check (no continueThread mutation) and custom choices buttons
import clsx from 'clsx';
import { Progress } from '@/modules/ui/progress/progress-circle';
import { Button } from '@/modules/ui/button';
import { Spinner } from '@/modules/ui/spinner';
import {
  HiOutlineShieldCheck,
  // HiOutlineShieldExclamation,
  HiPaperAirplane,
  HiShieldExclamation,
} from 'react-icons/hi2';
import { useProject } from '@/modules/project/provider';
import { useMemo } from 'react';
import { useStructuredOutputContext } from '../structured-output/context';

export function QualityCheckProgress({
  progress,
  type,
}: {
  progress: number;
  type: 'error' | 'warning' | 'idle' | 'success';
}) {
  let color = 'text-foreground-2';

  if (type === 'warning') {
    color = 'text-amber-600';
  } else if (type === 'idle') {
    color = 'text-foreground-2';
  } else if (type === 'success') {
    color = 'text-emerald-600';
  } else {
    color = 'text-rose-600';
  }
  return <Progress progress={progress} filledClassName={clsx(color)} />;
}

function QualityCheckText({
  totalPassed,
  totalChecks,
}: {
  totalPassed: number;
  totalChecks: number;
}) {
  return (
    <span className='text-foreground-2 font-mono'>
      <span className=''>
        {totalPassed}/{totalChecks}
      </span>{' '}
      <span className='font-bold'>Passed</span>
    </span>
  );
}

export function ThreadDetailsMessageCodeQualityCheck({
  onClick,
  isPending,
  diagnostics,
}: {
  onClick: () => void;
  isPending: boolean;
  diagnostics?: { name: string; result: string }[];
}) {
  const { data } = useStructuredOutputContext();
  const addedFiles = data?.replace_files || [];
  const removedFiles = data?.delete_files || [];
  const hasProposalFiles = addedFiles.length > 0 || removedFiles.length > 0;
  const project = useProject();

  const diagnosticChecks = useMemo(() => {
    return Object.values(project.plugins)
      .map((plugin) => {
        return plugin.sourceCodeHooks.filter((d) => d.operations.diagnostic);
      })
      .flat()
      .filter((d) => {
        return addedFiles.some((file) => new RegExp(d.rule).test(file.path));
      });
  }, [project]);

  const totalChecks = diagnosticChecks.length;

  const totalPassed = diagnostics?.filter((check) => !check.result).length || 0;

  const checksNotRanYet = isPending || !diagnostics || diagnostics.length === 0;
  const progress = Math.round((totalPassed / totalChecks) * 100) || 1;

  if (!hasProposalFiles) return <div className='w-full' />;

  return (
    <div className='flex w-full'>
      <Button
        onClick={onClick}
        variant={
          checksNotRanYet
            ? 'secondary'
            : totalChecks === totalPassed
              ? 'success'
              : 'error'
        }
        className='text-sm flex items-center gap-2 !bg-background-2'
      >
        <span>
          {isPending ? (
            <Spinner className='w-5 h-5' />
          ) : totalChecks === totalPassed ? (
            <HiOutlineShieldCheck className='w-5 h-5' />
          ) : (
            <HiShieldExclamation className='w-5 h-5' />
          )}
        </span>
        <span>
          <QualityCheckProgress
            progress={progress}
            type={
              checksNotRanYet
                ? 'idle'
                : totalChecks === totalPassed
                  ? 'warning'
                  : 'error'
            }
          />
        </span>
        <QualityCheckText totalPassed={totalPassed} totalChecks={totalChecks} />
        {!checksNotRanYet && totalPassed < totalChecks && (
          <span className='border-l border-border pl-2'>
            <HiPaperAirplane
              className={clsx(
                'w-5 h-5',
                'dark:text-rose-600 text-rose-500'
                // 'dark:text-amber-600 text-amber-500'
              )}
            />
          </span>
        )}
      </Button>
    </div>
  );
}
