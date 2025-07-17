import type { Message } from '@/server/db/schema';
import { createContext, useContext, useMemo } from 'react';

export interface ThreadDetailsMessageProps {
  data: Message;
  threadId: string;
  agentId?: string;
}

type AssistantMessageContext = {
  message: Message;
};

export const AssistantMessageContext =
  createContext<AssistantMessageContext | null>(null);

export function useAssistantMessageContext() {
  return useContext(AssistantMessageContext) as AssistantMessageContext;
}

export function AssistantMessageContextProvider({
  children,
  data,
}: { children: React.ReactNode } & ThreadDetailsMessageProps) {
  const contextValue = useMemo(() => {
    return {
      message: data,
    };
  }, [data]);

  return (
    <AssistantMessageContext.Provider value={contextValue}>
      {children}
    </AssistantMessageContext.Provider>
  );
}
