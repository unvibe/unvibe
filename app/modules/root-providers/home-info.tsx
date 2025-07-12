import { ClientEndpointsMap } from '@/server/api/client';
import { createContext, useContext } from 'react';

export type HomeInfo = ClientEndpointsMap['GET /home/info']['output'];

export const HomeInfoContext = createContext<HomeInfo | null>(null);

export function useHomeInfo() {
  const context = useContext(HomeInfoContext);
  if (!context) {
    throw new Error('useLLMModels must be used within a LLMModelsProvider');
  }
  return context;
}

export function HomeInfoProvider({
  children,
  info,
}: {
  children: React.ReactNode;
  info: HomeInfo;
}) {
  return (
    <HomeInfoContext.Provider value={info}>{children}</HomeInfoContext.Provider>
  );
}
