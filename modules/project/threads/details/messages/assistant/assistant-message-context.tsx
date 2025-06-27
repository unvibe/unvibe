import {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useMemo,
  useState,
} from 'react';
import { ThreadDetailsMessageProps } from '../_shared-types';
import type { ModelResponseStructure } from '@/server/llm/structured_output';
import { noop } from '@/lib/core/noop';

type StructuredContentState = {
  added: { path: string; content?: string; selected: boolean }[];
  removed: { path: string; content?: string; selected: boolean }[];
};

type AssistantMessageContext = {
  state: {
    get: () => StructuredContentState | null;
    set: Dispatch<SetStateAction<StructuredContentState | null>>;
  };
  metadata:
    | {
        type: 'tool_call';
        threadId: string;
        content: string;
      }
    | {
        type: 'structured';
        threadId: string;
        content: ModelResponseStructure | string;
        showAction: boolean;
        initialState: StructuredContentState | null;
      };
};

export const AssistantMessageContext =
  createContext<AssistantMessageContext | null>(null);

export function useAssistantMessageContext() {
  return useContext(AssistantMessageContext) as AssistantMessageContext;
}

function cleanUp(candidate: ModelResponseStructure | string) {
  if (typeof candidate === 'string') {
    return {
      message: candidate,
      proposal_id: '',
      proposed_files: {
        add: [],
        remove: [],
      },
      proposed_packages: { add: [], remove: [] },
    } as ModelResponseStructure;
  }

  const files = candidate?.proposed_files || { add: [], remove: [] };

  const addedFiles = files?.add?.filter(
    (file) => typeof file === 'object' && file.path
  );
  const removedFiles = files?.remove?.filter(
    (file) => typeof file === 'object' && file.path
  );

  return {
    ...candidate,
    proposed_files: {
      add: addedFiles,
      remove: removedFiles,
    },
    message: candidate.message || '',
  };
}

function parseMessageContent(
  _content: string | null
): ModelResponseStructure | string {
  const content = _content?.trim();
  if (!content) return '';
  try {
    if (content.startsWith('```json')) {
      const jsonString = content.slice(8, -3);
      return JSON.parse(jsonString);
    }
    if (content.startsWith('```typescript')) {
      const jsonString = content.slice(14, -3);
      return JSON.parse(jsonString);
    }
    if (content.startsWith('{')) {
      return JSON.parse(content);
    }
    if (content.startsWith('[')) {
      return JSON.parse(content);
    }
    return content;
  } catch (error) {
    console.error('Failed to parse JSON:', error);
    return content;
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
      const parsedContent = cleanUp(parseMessageContent(data.content));
      const addedFilesCount =
        typeof parsedContent !== 'string'
          ? parsedContent?.proposed_files?.add?.length || 0
          : 0;
      const removedFilesCount =
        typeof parsedContent !== 'string'
          ? parsedContent?.proposed_files?.remove?.length || 0
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
            parsedContent?.proposed_files?.add?.map((file) => ({
              ...file,
              selected: true,
            })) || [],
          removed:
            parsedContent?.proposed_files?.remove?.map((file) => ({
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
