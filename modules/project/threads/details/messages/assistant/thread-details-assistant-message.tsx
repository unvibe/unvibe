// UI for dev_propose_only agent, with full code quality check (no continueThread mutation) and custom choices buttons
import { Markdown } from '@/modules/markdown/ui/Markdown.client';
import clsx from 'clsx';
import { AssistantMessageActions } from './assistant-message-actions';
import { useAssistantMessageContext } from './assistant-message-context';
import { StructuredOutput } from './structured-output';

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className={clsx('flex w-full justify-start ps-4')}>
      <div
        className={clsx(
          'p-4 flex rounded-2xl max-w-[70%] w-full',
          'border border-border-1 bg-background-2'
        )}
      >
        <div className={clsx('whitespace-pre-wrap overflow-hidden w-full')}>
          {children}
        </div>
      </div>
    </div>
  );
}

export function ThreadDetailsAssistantMessage() {
  const value = useAssistantMessageContext();

  if (value.metadata.type === 'tool_call') {
    return null;
  }

  if (typeof value.metadata.content === 'string') {
    return (
      <Wrapper>
        <div className={clsx('flex items-center gap-2 text-xs')}>
          <Markdown
            initialHTML={value.metadata.content}
            text={value.metadata.content}
          />
        </div>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <StructuredOutput content={value.metadata.content} />
      {value.metadata.showAction && <AssistantMessageActions />}
    </Wrapper>
  );
}
