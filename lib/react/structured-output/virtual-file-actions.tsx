import clsx from 'clsx';
import React, { useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { Button, Checkbox } from '@/lib/ui';
import { useProject } from '~/modules/project/provider';
import { useAssistantMessageContext } from './assistant-message-context';
import { DiagnosticMessage } from '@/server/db/schema';
import { Modal } from '@/lib/ui/modal';
import { useAPIMutation, useAPIQuery } from '@/server/api/client';
import { TbEdit } from 'react-icons/tb';
import { Tooltip } from '@/lib/ui/tooltip';

const Editor = React.lazy(() =>
  import('@/lib/ui/monaco-editor')
    .then((module) => ({
      default: module.MonacoEditor,
    }))
    .catch((error) => {
      console.log('Failed to load Monaco Editor:', error);
      return {
        default: () => (
          <div className='text-red-500'>
            Failed to load editor. Please try again later.
          </div>
        ),
      };
    })
);

export interface FileActionProps {
  // props
  data: { path: string; content?: string };
  projectId: string;
  expanded: boolean;
  codeSnippetRef: React.RefObject<HTMLPreElement | null>;
  // actions
  setExpanded: (expanded: boolean) => void;
}

export function useFileDiagnostics(path: string) {
  const project = useProject();
  const metadata = useAssistantMessageContext().message.metadata;
  const diagnosticChecks = useMemo(() => {
    return Object.values(project.plugins)
      .map((plugin) => {
        return plugin.sourceCodeHooks.filter((d) => d.operations.diagnostic);
      })
      .flat()
      .filter((d) => {
        return new RegExp(d.rule).test(path);
      });
  }, [project]);
  return useMemo(() => {
    const array: (DiagnosticMessage & { checkName: string })[] = [];
    diagnosticChecks.forEach((check) => {
      const messages =
        metadata?.diagnostics?.[check.name]?.[path.replace('./', '')];
      messages?.forEach((message) => {
        array.push({
          checkName: check.name,
          ...message,
        });
      });
    });
    return array;
  }, []);
}

export function ThreadDetailsMessageListItemFileActions({
  data,
  icon,
  // expanded,
  enableEditing = false,
  // setExpanded,
  // codeSnippetRef,
  selected,
  setSelected,
  git,
}: {
  data: { path: string; content?: string };
  icon?: React.ReactNode;
  expanded: boolean;
  setExpanded: (expanded: boolean) => void;
  enableEditing?: boolean;
  codeSnippetRef: React.RefObject<HTMLPreElement | null>;
  selected?: boolean;
  setSelected?: (selected: boolean) => void;
  git?: { diff: string; additions: number; deletions: number };
}) {
  const id = useParams()?.id as string;
  const { refetch } = useAPIQuery('GET /threads/details', { id });
  const [showDiagnosticsModal, setShowDiagnosticsModal] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [editValue, setEditValue] = useState<string | undefined>(data.content);
  const [showEditModal, setShowEditModal] = useState(false);
  const message = useAssistantMessageContext().message;
  const metadata = message.metadata;
  const messageId = message.id;
  const params = useParams();
  const { path } = data;
  const projectId =
    typeof params.project_id === 'string' ? params.project_id : '';

  const project = useProject();

  const diagnosticChecks = useMemo(() => {
    return Object.values(project.plugins)
      .map((plugin) => {
        return plugin.sourceCodeHooks.filter((d) => d.operations.diagnostic);
      })
      .flat()
      .filter((d) => {
        return new RegExp(d.rule).test(data.path);
      });
  }, [project]);

  const fileResult = diagnosticChecks.map((check) => {
    const result =
      metadata?.diagnostics?.[check.name]?.[data.path.replace('./', '')];
    if (!result || result.length === 0) return 'passed';
    return result.some((message) => message.type === 'error')
      ? 'error'
      : 'warning';
  });

  // const passedCount = fileResult.filter((result) => result === 'passed').length;
  // const total = fileResult.length;
  // const progress = Math.round((passedCount / total) * 100) || 1;

  const collectedDiagnostics = useMemo(() => {
    const array: (DiagnosticMessage & { checkName: string })[] = [];
    diagnosticChecks.forEach((check) => {
      const messages =
        metadata?.diagnostics?.[check.name]?.[data.path.replace('./', '')];
      messages?.forEach((message) => {
        array.push({
          checkName: check.name,
          ...message,
        });
      });
    });
    return array;
  }, []);

  const status = fileResult.some((m) => m === 'error')
    ? 'error'
    : fileResult.some((m) => m === 'warning')
      ? 'warning'
      : 'success';

  const shouldShowDiagnostics = diagnosticChecks.length > 0;

  const { mutate: updateFile } = useAPIMutation(
    'POST /threads/edit-proposal-file'
  );
  const [showGitDiffModal, setShowGitDiffModal] = useState(false);

  return (
    <div className='p-1 font-mono pl-4 text-xs flex items-center justify-between'>
      <div className='flex items-center gap-2'>
        <Checkbox
          checked={selected}
          className='!w-5 !h-5 !rounded-full shrink-0'
          onClick={() => setSelected?.(!selected)}
          label=''
        />
        {icon && <span className='shrink-0 ps-2'>{icon}</span>}
        <div className='grid content-start ps-2'>
          <div className={clsx('text-foreground-2 line-clamp-1')} title={path}>
            {path.startsWith('./') ? `@${path.slice(1)}` : path}
          </div>
          <div className='flex items-center gap-2'>
            {git && (
              <button
                onClick={() => {
                  setShowGitDiffModal(true);
                }}
                className={clsx(
                  'justify-start flex items-center gap-1 text-xs font-mono text-foreground-2'
                )}
              >
                <div className={clsx('text-emerald-600')}>+{git.additions}</div>
                <div className={clsx('text-rose-600')}>-{git.deletions}</div>
                <div className='flex gap-px'>
                  <div className='w-2 h-2 bg-emerald-700' />
                  <div className='w-2 h-2 bg-emerald-700' />
                  <div className='w-2 h-2 bg-rose-700' />
                  <div className='w-2 h-2 bg-rose-700' />
                </div>
              </button>
            )}
          </div>
        </div>
      </div>
      <div className='flex items-center gap-1'>
        {enableEditing && (
          <button
            className='p-2 bg-background-1/50 text-foreground-2 rounded-xl flex items-center gap-1'
            onClick={() => setShowEditModal(true)}
          >
            <TbEdit className='w-5 h-5' />
          </button>
        )}
        {shouldShowDiagnostics && (
          <button className='p-2 bg-background-1/50 text-foreground-2 rounded-xl flex items-center gap-1'>
            <Tooltip
              content={collectedDiagnostics.map((d) => d.message).join('\n')}
            >
              <div className='w-5 h-5 flex items-center justify-center'>
                <div
                  className={clsx(
                    'w-3 h-3 rounded-full',
                    status === 'warning'
                      ? 'bg-amber-600'
                      : status === 'error'
                        ? 'bg-rose-700'
                        : 'bg-emerald-700'
                  )}
                />
              </div>
            </Tooltip>
          </button>
        )}
      </div>
      {showDiagnosticsModal && status !== 'success' && (
        <Modal
          onClose={() => setShowDiagnosticsModal(false)}
          className='max-w-4xl max-h-[80vh] overflow-y-auto'
        >
          <pre>{JSON.stringify(collectedDiagnostics, null, 2)}</pre>
        </Modal>
      )}
      {showEditModal && data.content && enableEditing && (
        <Modal
          onClose={() => setShowEditModal(false)}
          className='max-w-4xl max-h-[80vh] w-full h-full relative'
        >
          <div className='absolute top-4 right-4 z-50'>
            <Button
              onClick={() => {
                updateFile(
                  {
                    projectId,
                    messageId,
                    newContentFilePath: data.path,
                    newContentFileContent: editValue || data.content || '',
                  },
                  {
                    onSuccess: () => {
                      refetch().then(() => {
                        setShowEditModal(false);
                        setIsDirty(false);
                        setEditValue(data.content || '');
                      });
                    },
                  }
                );
              }}
              variant={isDirty ? 'success' : 'default'}
              className='text-sm'
            >
              Save
            </Button>
          </div>
          <Editor
            fileName={data.path.split('/').pop() || 'untitled'}
            content={data.content}
            value={editValue}
            height='80vh'
            onChange={(value) => {
              setEditValue(value);
              if (value !== data.content) {
                setIsDirty(true);
              } else {
                setIsDirty(false);
              }
            }}
          />
        </Modal>
      )}

      {showGitDiffModal && git?.diff && (
        <Modal
          onClose={() => setShowGitDiffModal(false)}
          className='max-w-4xl max-h-[80vh] w-full h-full relative'
        >
          <Editor
            fileName={'untitled.diff'}
            height='80vh'
            value={git.diff}
            content={git.diff}
          />
          {/* <Editor
            fileName={data.path.split('/').pop() || 'untitled'}
            value={data.content}
            content={data.content}
            height='80vh'
            showSideBySideDiff={false}
            showInlineDiff={true}
            original={original?.content || ''}
          /> */}
        </Modal>
      )}
    </div>
  );
}
