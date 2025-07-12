import { Theme } from '@/themes/type';
import { ReactQueryProvider } from './react-query';
import { ThemeProvider } from './theme';
import { LLMModelsProvider, LLMModelsServiceReturn } from './llm-models';
import { HomeInfo, HomeInfoProvider } from './home-info';

export function Provider({
  children,
  theme,
  models,
  homeInfo,
}: Readonly<{
  children: React.ReactNode;
  theme: Theme;
  models: LLMModelsServiceReturn;
  homeInfo: HomeInfo;
}>) {
  return (
    <ReactQueryProvider>
      <ThemeProvider theme={theme}>
        <HomeInfoProvider info={homeInfo}>
          <LLMModelsProvider models={models}>{children}</LLMModelsProvider>
        </HomeInfoProvider>
      </ThemeProvider>
    </ReactQueryProvider>
  );
}
