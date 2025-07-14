import { ThreadDetailsMessageProps } from '../_shared-types';
import { AssistantMessageContextProvider } from './assistant-message-context';
import { Markdown } from '~/modules/markdown/ui/Markdown';
import clsx from 'clsx';
import { useAssistantMessageContext } from './assistant-message-context';
import {
  StructuredOutput,
  StructuredOutputContextProvider,
} from './structured-output';
import { AcceptProposal } from './accept-proposal';
import { HiOutlineDuplicate } from 'react-icons/hi';
import { copyToClipboard } from '@/lib/browser/copy-to-clipboard';
import { useState } from 'react';
import { toast } from '@/lib/ui/notification';

function CopyButton({ content }: { content: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      title={copied ? 'Copied!' : 'Copy message'}
      className='absolute top-2 right-2 bg-background-2 border border-border rounded-xl p-2 opacity-0 group-hover:opacity-100 transition-opacity z-20'
      onClick={async (e) => {
        e.stopPropagation();
        await copyToClipboard(content);
        setCopied(true);
        toast.success('Copied to clipboard');
        setTimeout(() => setCopied(false), 1200);
      }}
      style={{ lineHeight: 0 }}
    >
      <HiOutlineDuplicate className='w-5 h-5' />
    </button>
  );
}

function Wrapper({
  children,
  copyableContent,
}: {
  children: React.ReactNode;
  copyableContent?: string;
}) {
  return (
    <div className={clsx('flex w-full justify-start ps-4')}>
      <div
        className={clsx(
          'p-4 flex rounded-2xl max-w-[70%] w-full group',
          'bg-background-2 relative'
        )}
      >
        <div className={clsx('whitespace-pre-wrap overflow-hidden w-full')}>
          {children}
        </div>
        {!!copyableContent && <CopyButton content={copyableContent} />}
      </div>
    </div>
  );
}

export function ThreadDetailsAssistantMessage() {
  const value = useAssistantMessageContext();

  console.log(value);
  // if it's a tool call, we don't render anything
  if (value.metadata.type === 'tool_call') {
    return null;
  }

  // if json parsing failed, we render the raw content
  if (typeof value.metadata.content === 'string') {
    return (
      <Wrapper copyableContent={value.metadata.content}>
        <div className={clsx('flex items-center gap-2 text-xs')}>
          <Markdown text={value.metadata.content} />
        </div>
      </Wrapper>
    );
  }

  // if it's a structured output, we render the structured output component
  const contentString =
    typeof value.metadata.content === 'string'
      ? value.metadata.content
      : value.metadata.content && typeof value.metadata.content === 'object'
        ? JSON.stringify(value.metadata.content, null, 2)
        : '';
  return (
    <Wrapper copyableContent={contentString}>
      <StructuredOutputContextProvider data={value.metadata.content}>
        <StructuredOutput />
        <AcceptProposal />
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
