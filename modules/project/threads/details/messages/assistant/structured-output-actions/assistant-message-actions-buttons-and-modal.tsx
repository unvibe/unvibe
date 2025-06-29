// UI for dev_propose_only agent, with full code quality check (no continueThread mutation) and custom choices buttons
import clsx from 'clsx';
import { useState } from 'react';
// import type { ModelResponseStructure } from '@/server/llm/structured_output';
import { Button, ButtonProps } from '@/modules/ui/button';
import { HiMiniArrowDownTray, HiOutlineEye } from 'react-icons/hi2';
import { useAPIMutation } from '@/server/api/client';
import { Spinner } from '@/modules/ui/spinner';
import { ConfirmModal } from './assistant-message-action-confirm-modal';
import { AssistantMessageDemoModal } from '../assitant-message-demo-modal';
import toast from 'react-hot-toast';
import { useParams } from '@/lib/next/navigation';
import { useStructuredOutputContext } from '../structured-output/context';

function PreviewButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      onClick={onClick}
      className={clsx(
        'font-mono text-sm px-4 py-2 rounded-xl cursor-pointer disabled:opacity-50 flex items-center gap-2'
      )}
    >
      <span>
        <HiOutlineEye className='w-5 h-5' />
      </span>
      <span>Preview</span>
    </Button>
  );
}

export function ThreadDetailsMessageChoiceButtons({
  diagnostics,
  isPending,
  hasChecks,
}: {
  diagnostics?: { name: string; result: string }[];
  isPending: boolean;
  hasChecks: boolean;
}) {
  const { data } = useStructuredOutputContext();
  const [showConfirm, setShowConfirm] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const params = useParams();
  const projectId =
    typeof params.project_id === 'string' ? params.project_id : '';

  const checksRan = !isPending && diagnostics && diagnostics?.length > 0;
  const passedDiagnostics = !isPending && diagnostics?.every((d) => !d.result);

  const { mutate, isPending: isWritingFiles } = useAPIMutation(
    'POST /projects/modify-files'
  );

  const {
    // mutate: packageManagerCommands,
    isPending: isRunningPackageManagerCommands,
  } = useAPIMutation('POST /projects/package-manager-commands');

  let color: ButtonProps['variant'] = 'default';

  if (checksRan) {
    if (passedDiagnostics) {
      color = 'success';
    } else {
      color = 'error';
    }
  }

  const writeOperations =
    data.replace_files?.map((file) => ({
      ...file,
      operation: 'write' as const,
    })) || [];
  const deleteOperations =
    data.delete_files?.map((file) => ({
      ...file,
      content: '',
      operation: 'delete' as const,
    })) || [];

  // const hasPackages = Boolean(
  //   proposed_packages?.add?.length || proposed_packages?.remove?.length
  // );
  const hasPackages = false;
  const hasProposalFiles = Boolean(
    data.replace_files?.length || data?.delete_files?.length
  );

  const installPackages = () => {
    // if (hasPackages) {
    //   const addPackages = proposed_packages?.add || [];
    //   const removePackages = proposed_packages?.remove || [];
    //   packageManagerCommands({
    //     projectId: projectId,
    //     packages: {
    //       install: addPackages,
    //       uninstall: removePackages,
    //     },
    //   });
    // } else {
    //   toast('No packages to install or uninstall');
    // }
  };

  const writeFiles = () => {
    if (hasProposalFiles) {
      console.log('modifying files @', projectId);
      mutate(
        {
          projectId: projectId,
          entries: [...writeOperations, ...deleteOperations],
        },
        // removed onSuccess: { result } since result was unused
        {
          onSettled() {
            setShowConfirm(false);
          },
        }
      );
    } else {
      toast('No files to write or delete');
    }
  };

  const proceed = () => {
    // if (hasPackages) {
    //   installPackages();
    // }
    if (hasProposalFiles) {
      writeFiles();
    }
  };

  const confirmOrProceed = () => {
    if (hasChecks) {
      if (!writeOperations.length && !deleteOperations.length && !hasPackages)
        return;
      if (needsConfirm) {
        setShowConfirm(true);
      } else {
        proceed();
      }
    } else {
      proceed();
    }
  };
  // Accept button is disabled if no checks ran
  const disabled = hasChecks
    ? !checksRan && (writeOperations.length > 0 || deleteOperations.length > 0)
    : false;

  // If any checks failed, require confirmation
  const needsConfirm =
    (diagnostics?.some((check) => !!check.result) && checksRan) || hasPackages;

  const prefixes = ['./app', 'app'];
  const firstPage = data.replace_files?.find(
    (file) =>
      prefixes.some((p) => file.path.startsWith(p)) &&
      file.path.endsWith('page.tsx')
  );
  const prefixMatch = prefixes.find((p) => firstPage?.path.startsWith(p));
  let url = firstPage?.path.slice(prefixMatch?.length, -1 * 'page.tsx'.length);
  if (!url?.startsWith('/')) {
    url = '/' + url;
  }

  return (
    <div className='flex items-center gap-2'>
      {firstPage ? (
        <PreviewButton
          onClick={() => {
            setShowDemo(true);
          }}
        />
      ) : null}
      <Button
        onClick={confirmOrProceed}
        variant={color}
        className={clsx(
          'font-mono text-sm px-4 py-2 rounded-xl cursor-pointer disabled:opacity-50 flex items-center gap-2'
        )}
        disabled={disabled}
      >
        <span>
          {isWritingFiles ? (
            <Spinner className='w-5 h-5' />
          ) : (
            <HiMiniArrowDownTray className='w-5 h-5' />
          )}
        </span>
        <span>Accept</span>
      </Button>
      {showDemo && url ? (
        <AssistantMessageDemoModal
          url={url}
          closeModal={() => setShowDemo(false)}
        />
      ) : null}
      {showConfirm ? (
        <ConfirmModal
          closeModal={() => setShowConfirm(false)}
          diagnostics={diagnostics}
          isRunningCommands={isRunningPackageManagerCommands}
          isWritingFiles={isWritingFiles}
          writeFiles={writeFiles}
          installPackages={installPackages}
        />
      ) : null}
    </div>
  );
}
