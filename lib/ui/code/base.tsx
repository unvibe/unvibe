import clsx from 'clsx';
import { escapeHTML } from '@/lib/core/string/escapeHTML';

const META_ADD = '@meta(++)';
const META_REMOVE = '@meta(--)';

const $lineNumber = (text: string, className = '') =>
  `<span class='px-2 ${className}'>${text}</span>`;

const $lineCode = (text: string, className = '') =>
  `<span class='px-2 ${className}'>${text}</span>`;

const formatLineNumber = (line: string, i: number) => {
  const lineNumber = `${(i + 1).toString()}\n`;
  if (line.startsWith(META_ADD)) {
    return $lineNumber(
      lineNumber,
      'theme-green text-foreground-5 bg-background'
    );
  }
  return $lineNumber(lineNumber, 'text-foreground-5');
};

function makeLines(code: string) {
  return escapeHTML(code)
    .split('\n')
    .map((line, i) => formatLineNumber(line, i))
    .join('');
}

const highlightUtils = {
  comment(line: string) {
    if (line.trim().startsWith('//') || line.trim().startsWith('#')) {
      return $lineCode(line, 'text-foreground-5');
    }
  },
  added(line: string, meta = META_ADD) {
    if (line.startsWith(meta)) {
      return $lineCode(
        line.slice(meta.length),
        'dark:text-emerald-400 dark:bg-emerald-800 text-emerald-500 bg-emerald-200'
      );
    }
  },
  removed(line: string, meta = META_REMOVE) {
    if (line.startsWith(meta)) {
      return $lineCode(
        line.slice(meta.length),
        'dark:text-red-400 dark:bg-red-800 text-red-500 bg-red-200'
      );
    }
  },
};

function transform(
  code: string,
  afterEscapeTransform?: (code: string) => string,
  isGitDiff = false
) {
  const escaped = escapeHTML(code); // before styling

  const withOptionalTransform = afterEscapeTransform
    ? afterEscapeTransform(escaped)
    : escaped;
  return withOptionalTransform
    .split('\n')
    .map((line) => {
      return (
        highlightUtils.comment(line) ||
        highlightUtils.added(line, isGitDiff ? '+' : META_ADD) ||
        highlightUtils.removed(line, isGitDiff ? '-' : META_REMOVE) ||
        $lineCode(line || '\n')
      );
    })
    .join('\n');
}

const wrapperClassName =
  'py-4 shrink-0 h-full flex flex-col justify-center whitespace-pre';

export function Code({
  code,
  beforeBaseTransform,
  className,
  isDiff = false,
}: {
  code: string;
  beforeBaseTransform?: (code: string) => string;
  className?: string;
  isDiff?: boolean;
}) {
  return (
    <pre
      className={clsx(
        'bg-background-1 rounded-3xl text-left font-mono border border-border-1 text-foreground-2 flex items-stretch overflow-hidden whitespace-pre',
        className
      )}
    >
      <code
        dangerouslySetInnerHTML={{
          __html: makeLines(code),
        }}
        className={clsx(
          'border-r border-border-1 text-right bg-background-2/50 w-[4ch]',
          wrapperClassName
        )}
      />
      <code
        className={clsx('overflow-x-auto w-[calc(100%-4ch)]', wrapperClassName)}
        dangerouslySetInnerHTML={{
          __html: transform(code, beforeBaseTransform, isDiff),
        }}
      />
    </pre>
  );
}

export function InlineCode({ code }: { code: string }) {
  return (
    <span className='inline-block text-foreground bg-background-1 text-sm p-1 px-2 rounded-lg font-mono'>
      {code}
    </span>
  );
}
