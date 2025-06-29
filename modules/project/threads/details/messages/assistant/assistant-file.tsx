import { useCallback, useRef, useState } from 'react';
import { ThreadDetailsMessageListItemFileActions } from './assistant-file-actions';
import { ThreadDetailsMessageListItemFileContent } from './assistant-file-content';

export function ThreadDetailsMessageListItemFile({
  data,
  selected,
  setSelected,
  icon,
  NO_CONTENT = false,
}: {
  icon?: React.ReactNode;
  type: 'add' | 'remove';
  data: { path: string; content?: string };
  setSelected?: (selected: boolean) => void;
  selected?: boolean;
  NO_CONTENT?: boolean;
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
      />
      {!NO_CONTENT && (
        <ThreadDetailsMessageListItemFileContent
          data={data}
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
