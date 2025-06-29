import clsx from 'clsx';
import { useMemo, useState } from 'react';
import { useParams } from '@/lib/next/navigation';
import { Checkbox } from '@/modules/ui';
import { useProject, useProjectActions } from '@/modules/project/provider';
import { useAssistantMessageContext } from './assistant-message-context';
import { QualityCheckProgress } from './structured-output-actions/assistant-message-run-checks';
import { DiagnosticMessage } from '@/server/db/schema';
import { Modal } from '@/modules/ui/modal';

export interface FileActionProps {
  // props
  data: { path: string; content?: string };
  projectId: string;
  expanded: boolean;
  codeSnippetRef: React.RefObject<HTMLPreElement | null>;
  // actions
  setExpanded: (expanded: boolean) => void;
}

export function ThreadDetailsMessageListItemFileActions({
  data,
  icon,
  expanded,
  setExpanded,
  codeSnippetRef,
  selected,
  setSelected,
}: {
  data: { path: string; content?: string };
  icon?: React.ReactNode;
  expanded: boolean;
  setExpanded: (expanded: boolean) => void;
  codeSnippetRef: React.RefObject<HTMLPreElement | null>;
  selected?: boolean;
  setSelected?: (selected: boolean) => void;
}) {
  const [showDiagnosticsModal, setShowDiagnosticsModal] = useState(false);
  const metadata = useAssistantMessageContext().message.metadata;
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
      </div>
      {showDiagnosticsModal && (
        <Modal onClose={() => setShowDiagnosticsModal(false)}>
          <pre>{JSON.stringify(collectedDiagnostics, null, 2)}</pre>
        </Modal>
      )}
    </div>
  );
}
