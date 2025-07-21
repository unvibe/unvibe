import type { Message } from '@/server/db/schema';
import {
  AssistantMessageContextProvider,
  useAssistantMessageContext,
} from '@/lib/react/structured-output/assistant-message-context';
import {
  SelectionItem,
  StructuredOutputContextProvider,
} from '@/lib/react/structured-output/structured-output-context';
import { useParams } from 'react-router';
import { Markdown } from '~/modules/markdown/ui/Markdown';
import clsx from 'clsx';
import { HiOutlineDuplicate } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { copyToClipboard } from '@/lib/browser/copy-to-clipboard';
import { useMemo, useState } from 'react';

// import structured output components
import * as ClientPlugins from '@/plugins/plugins-client';
import { AcceptProposal } from './accept-proposal';

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

  const isToolCall =
    value.message.tool_calls &&
    value.message.tool_calls.length > 0 &&
    !value.message.content;

  // if it's a tool call, we don't render anything
  if (isToolCall) {
    return null;
  }

  // if json parsing failed, we render the raw content
  if (!value.message.metadata?.parsed) {
    const message = (() => {
      try {
        return JSON.parse(value.message.content || '').message;
      } catch {
        return value.message.content || '';
      }
    })();
    return (
      <Wrapper copyableContent={value.message.content || ''}>
        <div className={clsx('flex items-center gap-2')}>
          <Markdown text={message} />
        </div>
      </Wrapper>
    );
  }

  // if it's a structured output, we render the structured output component
  const contentString = JSON.stringify(value.message.metadata.parsed, null, 2);

  const components = useMemo(() => {
    let defaultState: Record<string, SelectionItem[]> = {};

    const _components = Object.keys(value?.message?.metadata?.parsed || {}).map(
      (so_key) => {
        return Object.values(ClientPlugins).find(({ Plugin }) => {
          const component = Plugin.structuredOutput?.[so_key];
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const getDefaultState = (component as any)?.getDefaultState;
          if (typeof getDefaultState === 'function') {
            const defaultSelection = getDefaultState(
              value?.message?.metadata?.parsed[so_key]
            );
            if (defaultSelection) {
              defaultState = { ...defaultState, ...defaultSelection };
            }
          }
          return Plugin.structuredOutput?.[so_key];
        })?.Plugin.structuredOutput?.[so_key];
      }
    );

    return { components: _components, defaultState };
  }, [value?.message?.metadata?.parsed]);

  return (
    <Wrapper copyableContent={contentString}>
      <StructuredOutputContextProvider
        data={value.message.metadata.parsed}
        defaultState={components.defaultState}
      >
        <div className='grid gap-2'>
          {components.components.map((Component, index) => {
            if (!Component) {
              console.warn(`Structured output component not found`);
              return null;
            }
            return <Component key={index} />;
          })}
        </div>
        <AcceptProposal />
      </StructuredOutputContextProvider>
    </Wrapper>
  );
}

export function AssistantMessage({ message }: { message: Message }) {
  const threadId = useParams()?.id as string;

  return (
    <AssistantMessageContextProvider data={message} threadId={threadId}>
      <ThreadDetailsAssistantMessage />
    </AssistantMessageContextProvider>
  );
}
