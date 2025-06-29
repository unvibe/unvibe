import clsx from 'clsx';
import React, { useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { Button, Checkbox } from '@/modules/ui';
import { useProject, useProjectActions } from '@/modules/project/provider';
import { useAssistantMessageContext } from './assistant-message-context';
import { DiagnosticMessage } from '@/server/db/schema';
import { Modal } from '@/modules/ui/modal';
import { Progress } from '@/modules/ui/progress/progress-circle';
import { HiPencilSquare } from 'react-icons/hi2';
import { useAPIMutation, useAPIQuery } from '@/server/api/client';

const Editor = React.lazy(() =>
  import('@/modules/ui/monaco-editor').then((module) => ({
    default: module.MonacoEditor,
  }))
);

function QualityCheckProgress({
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
  expanded,
  enableEditing = false,
  setExpanded,
  codeSnippetRef,
  selected,
  setSelected,
}: {
  data: { path: string; content?: string };
  icon?: React.ReactNode;
  expanded: boolean;
  setExpanded: (expanded: boolean) => void;
  enableEditing?: boolean;
  codeSnippetRef: React.RefObject<HTMLPreElement | null>;
  selected?: boolean;
  setSelected?: (selected: boolean) => void;
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

  const fileActionsProps: FileActionProps = useMemo(() => {
    return {
      data,
      projectId,
      expanded,
      codeSnippetRef,
      setExpanded,
    };
  }, [data, projectId, expanded, codeSnippetRef, setExpanded]);

  const projectContext = useProjectActions();

  const pathDiagnostics = useMemo(() => {
    const plugins = projectContext.clientPlugins;
    const pluginsWithPathDiagnostics = plugins.filter(
      (plugin) => plugin.Plugin.components?.assistant?.proposal?.pathDiagnostics
    );

    return pluginsWithPathDiagnostics
      .map((plugin) =>
        Object.values(
          plugin.Plugin.components.assistant!.proposal!.pathDiagnostics!
        )
      )
      .flat();
  }, [projectContext]);

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

  const passedCount = fileResult.filter((result) => result === 'passed').length;
  const total = fileResult.length;
  const progress = Math.round((passedCount / total) * 100) || 1;

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
            {pathDiagnostics.map((PathDiagnostics, index) => (
              <PathDiagnostics key={index} {...fileActionsProps} />
            ))}
          </div>
        </div>
      </div>
      <div className='flex items-center gap-1'>
        {enableEditing && (
          <button
            className='p-2 bg-background-1/50 text-foreground-2 rounded-xl flex items-center gap-1'
            onClick={() => setShowEditModal(true)}
          >
            <HiPencilSquare className='w-5 h-5' />
          </button>
        )}
        {shouldShowDiagnostics && (
          <button
            className='p-2 bg-background-1/50 text-foreground-2 rounded-xl flex items-center gap-1'
            onClick={() => {
              setShowDiagnosticsModal(true);
            }}
          >
            <QualityCheckProgress
              progress={progress}
              type={
                fileResult.some((m) => m === 'error')
                  ? 'error'
                  : fileResult.some((m) => m === 'warning')
                    ? 'warning'
                    : 'success'
              }
            />
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
            fileName={data.path}
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
    </div>
  );
}
