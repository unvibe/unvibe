import clsx from 'clsx';
import { useMemo } from 'react';
import { useParams } from '@/lib/next/navigation';
import { Checkbox } from '@/modules/ui';
import { useProjectActions } from '@/modules/project/provider';
import { HiChevronDown } from 'react-icons/hi2';

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

  // const actions = useMemo(() => {
  //   const plugins = projectContext.clientPlugins;
  //   const pluginsWithActions = plugins.filter(
  //     (plugin) => plugin.Plugin.components?.assistant?.proposal?.actions
  //   );

  //   return pluginsWithActions
  //     .map((plugin) =>
  //       Object.values(plugin.Plugin.components.assistant!.proposal!.actions!)
  //     )
  //     .flat();
  // }, [projectContext]);

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
        <button className='p-2 bg-background-1/50 text-foreground-2 rounded-xl'>
          <HiChevronDown className='w-5 h-5' />
        </button>
        {/* {actions.map((Action, index) => (
          <Action key={index} {...fileActionsProps} />
        ))} */}
      </div>
    </div>
  );
}
