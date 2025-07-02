import { Markdown } from '@/modules/markdown/ui/Markdown';
import clsx from 'clsx';
import { ThreadDetailsMessageProps } from '../_shared-types';

export function ThreadDetailsMessageTool({ data }: ThreadDetailsMessageProps) {
  return null;
  // TODO: implement this
  const parsedContent =
    'model got the result of a tool use \n\n' + data.tool_call_id;
  return (
    <div className={clsx('flex w-full justify-start ps-4')}>
      <div
        className={clsx(
          'p-4 flex rounded-2xl max-w-[70%]',
          'border border-border-1 bg-background-2'
        )}
      >
        <div className={clsx('whitespace-pre-wrap font-mono')}>
          <Markdown
            initialHTML={parsedContent || ''}
            text={parsedContent || ''}
          />
        </div>
      </div>
    </div>
  );
}
