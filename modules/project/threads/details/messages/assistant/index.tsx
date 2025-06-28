import { ThreadDetailsMessageProps } from '../_shared-types';
import { AssistantMessageContextProvider } from './assistant-message-context';
import { Markdown } from '@/modules/markdown/ui/Markdown.client';
import clsx from 'clsx';
import { AssistantMessageActions } from './structured-output-actions/assistant-message-actions';
import { useAssistantMessageContext } from './assistant-message-context';
import {
  StructuredOutput,
  StructuredOutputContextProvider,
} from './structured-output';

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

  // if it's a tool call, we don't render anything
  if (value.metadata.type === 'tool_call') {
    return null;
  }

  // if json parsing failed, we render the raw content
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

  // if it's a structured output, we render the structured output component
  return (
    <Wrapper>
      <StructuredOutputContextProvider data={value.metadata.content}>
        <StructuredOutput />
        {value.metadata.showAction && <AssistantMessageActions />}
      </StructuredOutputContextProvider>
    </Wrapper>
  );
}

export function ThreadDetailsMessageAssistant({
  data,
  threadId,
}: ThreadDetailsMessageProps) {
  return (
    <AssistantMessageContextProvider data={data} threadId={threadId}>
      <ThreadDetailsAssistantMessage />
    </AssistantMessageContextProvider>
  );
}
