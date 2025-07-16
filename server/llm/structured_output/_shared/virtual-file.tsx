import { useCallback, useRef, useState } from 'react';
import { ThreadDetailsMessageListItemFileActions } from './virtual-file-actions';
import { ThreadDetailsMessageListItemFileContent } from './virtual-file-content';
import { Decorations } from '~/modules/markdown/library/parser';

export function ThreadDetailsMessageListItemFile({
  data,
  selected,
  setSelected,
  icon,
  NO_CONTENT = false,
  decorations,
  enabledEditing = false,
  git,
}: {
  icon?: React.ReactNode;
  type?: 'add' | 'remove' | 'edit';
  data: { path: string; content?: string };
  setSelected?: (selected: boolean) => void;
  selected?: boolean;
  NO_CONTENT?: boolean;
  decorations?: Decorations;
  git?: { diff: string; additions: number; deletions: number };
  enabledEditing?: boolean;
}) {
  const [expaneded, setExpanded] = useState(true);
  const codeSnippetRef = useRef<HTMLPreElement | null>(null);

  const initCodeSnippet = useCallback((node: HTMLPreElement | null) => {
    if (!node) return;
    codeSnippetRef.current = node;

    if (node) {
      if (node.clientHeight === 300) {
        setExpanded(false);
      }
    }
  }, []);

  return (
    <div className='grid border border-border rounded-2xl overflow-hidden'>
      <ThreadDetailsMessageListItemFileActions
        data={data}
        icon={icon}
        expanded={expaneded}
        setExpanded={setExpanded}
        selected={selected}
        setSelected={setSelected}
        codeSnippetRef={codeSnippetRef}
        enableEditing={enabledEditing}
        git={git}
      />
      {!NO_CONTENT && (
        <ThreadDetailsMessageListItemFileContent
          data={data}
          decorations={decorations}
          initCodeSnippet={initCodeSnippet}
          expanded={expaneded}
          setExpanded={setExpanded}
          codeSnippetRef={codeSnippetRef}
          selected={selected}
          setSelected={setSelected}
        />
      )}
    </div>
  );
}
