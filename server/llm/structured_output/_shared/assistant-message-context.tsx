import type { Message } from '@/server/db/schema';
import {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useMemo,
  useState,
} from 'react';
import type { StructuredOutput } from '@/server/llm/structured_output';
import { noop } from '@/lib/core/noop';

export interface ThreadDetailsMessageProps {
  data: Message;
  threadId: string;
  agentId?: string;
}

type StructuredContentState = {
  added: { path: string; content?: string; selected: boolean }[];
  removed: { path: string; content?: string; selected: boolean }[];
};

type AssistantMessageContext = {
  state: {
    get: () => StructuredContentState | null;
    set: Dispatch<SetStateAction<StructuredContentState | null>>;
  };
  message: Message;
  metadata:
    | {
        type: 'tool_call';
        threadId: string;
        content: string;
      }
    | {
        type: 'structured';
        threadId: string;
        content: StructuredOutput | string;
        showAction: boolean;
        initialState: StructuredContentState | null;
      };
};

export const AssistantMessageContext =
  createContext<AssistantMessageContext | null>(null);

export function useAssistantMessageContext() {
  return useContext(AssistantMessageContext) as AssistantMessageContext;
}

function parseMessageContent(_content: string | null): StructuredOutput {
  const content = _content?.trim();
  if (!content) return { message: '-- No content provided --' };
  try {
    if (content.startsWith('```json')) {
      const jsonString = content.slice(8, -3);
      return JSON.parse(jsonString) as StructuredOutput;
    }
    if (content.startsWith('```typescript')) {
      const jsonString = content.slice(14, -3);
      return JSON.parse(jsonString) as StructuredOutput;
    }
    if (content.startsWith('{')) {
      return JSON.parse(content) as StructuredOutput;
    }
    if (content.startsWith('[')) {
      return JSON.parse(content) as StructuredOutput;
    }
    return JSON.parse(content);
  } catch (error) {
    return { message: `Failed to parse content ${error}` };
  }
}

export function AssistantMessageContextProvider({
  children,
  data,
  threadId,
}: { children: React.ReactNode } & ThreadDetailsMessageProps) {
  const metadata: AssistantMessageContext['metadata'] = useMemo(() => {
    const isToolCall =
      data.tool_calls && data.tool_calls.length > 0 && !data.content;

    if (isToolCall) {
      return {
        type: 'tool_call',
        threadId,
        content:
          data.tool_calls
            ?.map(
              (call) =>
                `${call.function.name}(${JSON.stringify(JSON.parse(call.function.arguments), null, 2)})`
            )
            .join('\n\n') || '',
      } as const;
    }

    try {
      const parsedContent =
        data.metadata?.parsed || parseMessageContent(data.content);

      if (typeof parsedContent.message !== 'string') {
        parsedContent.message = '';
      }
      const addedFilesCount =
        typeof parsedContent !== 'string'
          ? parsedContent?.replace_files?.length || 0
          : 0;
      const removedFilesCount =
        typeof parsedContent !== 'string'
          ? parsedContent?.delete_files?.length || 0
          : 0;

      const showAction =
        typeof parsedContent !== 'string' &&
        !!parsedContent &&
        (addedFilesCount > 0 || removedFilesCount > 0);

      return {
        type: 'structured',
        content: parsedContent,
        showAction,
        threadId,
        initialState: {
          added:
            parsedContent?.replace_files?.map((file) => ({
              ...file,
              selected: true,
            })) || [],
          removed:
            parsedContent?.delete_files?.map((file) => ({
              ...file,
              selected: true,
            })) || [],
        },
      } as const;
    } catch (error) {
      noop(error);
      return {
        type: 'structured',
        threadId,
        content: data.content || '',
        showAction: false,
        initialState: null,
      } as const;
    }
  }, [data, threadId]);

  const [selectedFiles, setSelectedFiles] = useState(
    metadata.type === 'structured' ? metadata.initialState : null
  );

  const contextValue = useMemo(() => {
    return {
      metadata,
      message: data,
      state: {
        get: () => selectedFiles,
        set: setSelectedFiles,
      },
    };
  }, [metadata, setSelectedFiles, selectedFiles]);

  return (
    <AssistantMessageContext.Provider value={contextValue}>
      {children}
    </AssistantMessageContext.Provider>
  );
}
