import { Decorations, highlightCode } from '~/modules/markdown/library/parser';
import clsx from 'clsx';
import { useEffect, useState } from 'react';
import { useFileDiagnostics } from './virtual-file-actions';
import { useTheme } from '~/modules/root-providers/theme';

function htmlEscape(text: string) {
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function makeFallback(content: string) {
  const prefix = '<pre><code>';
  const suffix = '</code></pre>';
  const lines = content
    .split('\n')
    .map((line) => `<span>${htmlEscape(line)}</span>`);
  return prefix + lines.join('\n') + suffix;
}

function mergeDecorations(
  decorations: Decorations,
  diagnosticsDecorations: Decorations
): Decorations {
  if (!decorations && !diagnosticsDecorations) {
    return [];
  } else if (!decorations) {
    return diagnosticsDecorations;
  } else if (!diagnosticsDecorations) {
    return decorations;
  } else if (decorations.length === 0) {
    return diagnosticsDecorations;
  } else if (diagnosticsDecorations.length === 0) {
    return decorations;
  } else {
    // now we merge the two arrays
    // let's opt in a bad (quadratic) solution for now
    // so we merge the two arrays and each iteration we check if the ranges overlap
    const merged = [...decorations, ...diagnosticsDecorations].map(
      (decoration) => {
        return decoration;
      }
    );

    return merged;
  }
}

export function ThreadDetailsMessageListItemFileContent({
  data,
  initCodeSnippet,
  expanded,
  setExpanded,
  codeSnippetRef,
  selected,
  decorations,
}: {
  expanded: boolean;
  setExpanded: (newState: boolean) => void;
  data: { path: string; content?: string };
  initCodeSnippet: (node: HTMLPreElement | null) => void;
  codeSnippetRef: React.RefObject<HTMLPreElement | null>;
  selected?: boolean;
  setSelected?: (selected: boolean) => void;
  decorations?: Decorations;
}) {
  const [theme] = useTheme();
  const [highlighted, setHighlighted] = useState(
    makeFallback(data.content || '')
  );
  const { content, path } = data;

  const diagnostics = useFileDiagnostics(data.path);

  useEffect(() => {
    const ext = path.split('.').pop() || 'text';

    const linesMap: Record<number, (typeof diagnostics)[number][]> = {};

    diagnostics.forEach((d) => {
      if (!linesMap[d.line]) {
        linesMap[d.line] = [];
      }
      linesMap[d.line].push(d);
    });

    const diagnosticsDecorations = Object.keys(linesMap)
      .map((lineNumber) => {
        const messages = linesMap[Number(lineNumber)];
        return messages.map((d) => {
          const startLine = d.line - 1;
          const endLine = d.line - 1;
          const startCharacter = d.column - 1;
          const endCharacter =
            content?.split('\n')[d.line - 1]?.length || startCharacter + 3;
          return {
            start: { line: startLine, character: startCharacter },
            end: { line: endLine, character: endCharacter },
            properties: {
              class: 'error-underline',
              ['data-title']: linesMap[Number(lineNumber)]
                .map((d) => d.message)
                .join('\n'),
            },
          };
        });
      })
      .flat();

    const allDecorations = mergeDecorations(
      decorations,
      diagnosticsDecorations
    );

    highlightCode(content || '', ext, theme.shiki, allDecorations)
      .then((result) => {
        setHighlighted(result);
      })
      .catch((e) => {
        console.warn('Decoration failed', e, allDecorations);
        return highlightCode(content || '', ext, theme.shiki).then((result) => {
          setHighlighted(result);
        });
      });
  }, [content, path]);

  return (
    <div className='rounded-xl rounded-t-none max-w-full overflow-hidden relative'>
      <pre
        ref={initCodeSnippet}
        dangerouslySetInnerHTML={{ __html: highlighted }}
        className={clsx(
          'relative text-foreground-1 whitespace-pre-wrap text-xs font-mono max-h-[300px] overflow-hidden',
          '[&>*]:px-4 [&>*]:pt-3 [&>*]:pb-4 [&>*]:overflow-x-auto',
          !selected && 'opacity-20'
        )}
      />
      {!expanded && (
        <div className='absolute bottom-1 w-full flex justify-center font-mono text-sm'>
          <div className='absolute -bottom-1 h-[50px] inset-x-0 bg-gradient-to-t from-background-2 via-background-2/50 to-transparent'></div>
          <button
            className='text-foreground-2 bg-background-1 border-border z-10 px-4 py-1 rounded-lg shadow dark:shadow-black/20 cursor-pointer'
            onClick={() => {
              setExpanded(true);
              if (codeSnippetRef.current) {
                codeSnippetRef.current.classList.remove('max-h-[300px]');
              }
            }}
          >
            ... show more
          </button>
        </div>
      )}
    </div>
  );
}
