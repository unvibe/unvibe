import type { Message } from '@/server/db/schema';
import {
  AssistantMessageContextProvider,
  useAssistantMessageContext,
} from './_shared/assistant-message-context';
import { StructuredOutputContextProvider } from './_shared/structured-output-context';
import { useParams } from 'react-router';
import { Markdown } from '~/modules/markdown/ui/Markdown';
import clsx from 'clsx';
import { HiOutlineDuplicate } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { copyToClipboard } from '@/lib/browser/copy-to-clipboard';
import { useState } from 'react';

// import structured output components
import { StructuredOutputReplaceFiles } from './replace_files/component';
import { StructuredOutputDeleteFiles } from './delete_files/component';
import { StructuredOutputShellScripts } from './shell_scripts/component';
import { StructuredOutputMessage } from './message/component';
import { StructuredOutputSuggestedActions } from './suggested_actions/component';
import { AcceptProposal } from './accept-proposal';
import { StructuredOutputCodemodScripts } from './codemod_scripts/component';
import { StructuredOutputEditInstructions } from './edit_instructions/component';
import { StructuredOutputFindAndReplace } from './find_and_replace/component';
import { StructuredOutputPatchFiles } from './patch_files/component';

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
        <StructuredOutputMessage />
        <StructuredOutputShellScripts />
        <StructuredOutputDeleteFiles />
        <StructuredOutputReplaceFiles />
        <StructuredOutputSuggestedActions />
        <StructuredOutputCodemodScripts />
        <StructuredOutputEditInstructions />
        <StructuredOutputFindAndReplace />
        <StructuredOutputPatchFiles />
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
