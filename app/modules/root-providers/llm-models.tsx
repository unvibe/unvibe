import { ClientEndpointsMap } from '@/server/api/client';
import { createContext, useContext } from 'react';

export type LLMModelsServiceReturn =
  ClientEndpointsMap['GET /models']['output'];

export const LLMModelsContext = createContext<LLMModelsServiceReturn | null>(
  null
);

export function useLLMModels() {
  const context = useContext(LLMModelsContext);
  if (!context) {
    throw new Error('useLLMModels must be used within a LLMModelsProvider');
  }
  return context;
}

export function LLMModelsProvider({
  children,
  models,
}: {
  children: React.ReactNode;
  models: LLMModelsServiceReturn;
}) {
  return (
    <LLMModelsContext.Provider value={models}>
      {children}
    </LLMModelsContext.Provider>
  );
}
